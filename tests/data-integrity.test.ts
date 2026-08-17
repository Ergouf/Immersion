import assert from 'node:assert/strict';
import test from 'node:test';
import type { SQLiteDatabase } from 'expo-sqlite';

import { BackupRepository } from '../src/data/repositories/backup-repository';
import {
  ActiveSessionRequiredError,
  SQLiteDistractionRepository,
} from '../src/data/repositories/distraction-repository';
import { LATEST_SCHEMA_VERSION, migrateDatabase } from '../src/data/migrations';
import { createBackup } from '../src/domain/backup';
import type { Distraction } from '../src/domain/distraction';
import type { Session } from '../src/domain/session';

const now = Date.UTC(2026, 0, 8, 12);

const session: Session = {
  id: 'session-1',
  title: '读书',
  startedAt: now - 60_000,
  endedAt: now,
  immersionLevel: 2,
  immersionDelayMinutes: 1,
  endReason: 'completed',
  createdAt: now - 60_000,
  updatedAt: now,
  schemaVersion: 1,
};

const distraction: Distraction = {
  id: 'thought-1',
  sessionId: session.id,
  text: '记得回邮件',
  createdAt: now - 30_000,
};

function toSessionRow(value: Session) {
  return {
    id: value.id,
    title: value.title,
    started_at: value.startedAt,
    ended_at: value.endedAt,
    immersion_level: value.immersionLevel,
    immersion_delay_minutes: value.immersionDelayMinutes,
    end_reason: value.endReason,
    created_at: value.createdAt,
    updated_at: value.updatedAt,
    schema_version: value.schemaVersion,
  };
}

function toDistractionRow(value: Distraction) {
  return {
    id: value.id,
    session_id: value.sessionId,
    text: value.text,
    created_at: value.createdAt,
  };
}

class FakeTransaction {
  readonly writes: { sql: string; parameters: unknown[] }[] = [];

  constructor(
    private readonly sessionRows: ReturnType<typeof toSessionRow>[],
    private readonly distractionRows: ReturnType<typeof toDistractionRow>[],
  ) {}

  async getAllAsync<T>(sql: string): Promise<T[]> {
    const rows = sql.includes('FROM sessions') ? this.sessionRows : this.distractionRows;
    return rows.map((row) => ({ ...row })) as unknown as T[];
  }

  async runAsync(sql: string, ...parameters: unknown[]) {
    this.writes.push({ sql, parameters });
    return { changes: 1, lastInsertRowId: this.writes.length };
  }
}

class FakeDatabase {
  readonly transaction: FakeTransaction;
  exclusiveTransactions = 0;

  constructor(localSessions: Session[] = [], localDistractions: Distraction[] = []) {
    this.transaction = new FakeTransaction(
      localSessions.map(toSessionRow),
      localDistractions.map(toDistractionRow),
    );
  }

  async withExclusiveTransactionAsync(task: (transaction: FakeTransaction) => Promise<void>) {
    this.exclusiveTransactions += 1;
    await task(this.transaction);
  }

  async getAllAsync(): Promise<never> {
    throw new Error('快照查询不得使用可被其他异步查询插入的主连接。');
  }

  async runAsync(): Promise<never> {
    throw new Error('导入写入不得使用可被其他异步查询插入的主连接。');
  }
}

test('backup snapshot and merge stay on an exclusive transaction connection', async () => {
  const snapshotDatabase = new FakeDatabase([session], [distraction]);
  const snapshotRepository = new BackupRepository(snapshotDatabase as unknown as SQLiteDatabase);
  assert.deepEqual(await snapshotRepository.snapshot(), {
    sessions: [session],
    distractions: [distraction],
  });
  assert.equal(snapshotDatabase.exclusiveTransactions, 1);

  const mergeDatabase = new FakeDatabase();
  const mergeRepository = new BackupRepository(mergeDatabase as unknown as SQLiteDatabase);
  const result = await mergeRepository.merge(createBackup([session], [distraction], now));
  assert.deepEqual(result, {
    insertedSessions: 1,
    insertedDistractions: 1,
    skippedSessions: 0,
    skippedDistractions: 0,
  });
  assert.equal(mergeDatabase.exclusiveTransactions, 1);
  assert.equal(mergeDatabase.transaction.writes.length, 2);
});

test('backup merge plans against the data read inside its transaction', async () => {
  const sameDatabase = new FakeDatabase([session], [distraction]);
  const sameRepository = new BackupRepository(sameDatabase as unknown as SQLiteDatabase);
  assert.deepEqual(await sameRepository.merge(createBackup([session], [distraction], now)), {
    insertedSessions: 0,
    insertedDistractions: 0,
    skippedSessions: 1,
    skippedDistractions: 1,
  });
  assert.equal(sameDatabase.transaction.writes.length, 0);

  const conflictDatabase = new FakeDatabase([{ ...session, title: '本地标题' }]);
  const conflictRepository = new BackupRepository(conflictDatabase as unknown as SQLiteDatabase);
  await assert.rejects(
    () => conflictRepository.merge(createBackup([session], [], now)),
    /与本地内容冲突/,
  );
  assert.equal(conflictDatabase.transaction.writes.length, 0);
});

test('migration refuses a newer database without changing its schema', async () => {
  const executed: string[] = [];
  const database = {
    async execAsync(sql: string) {
      executed.push(sql);
    },
    async getFirstAsync<T>(sql: string): Promise<T> {
      assert.equal(sql, 'PRAGMA user_version');
      return { user_version: LATEST_SCHEMA_VERSION + 1 } as T;
    },
  } as unknown as SQLiteDatabase;

  await assert.rejects(() => migrateDatabase(database), /高于当前支持/);
  assert.deepEqual(executed, ['PRAGMA foreign_keys = ON;']);
});

test('distraction insertion checks active state in the same SQL statement', async () => {
  const parameters: unknown[][] = [];
  const activeDatabase = {
    async runAsync(_sql: string, ...values: unknown[]) {
      parameters.push(values);
      return { changes: 1, lastInsertRowId: 1 };
    },
  } as unknown as SQLiteDatabase;
  const activeRepository = new SQLiteDistractionRepository(activeDatabase);
  assert.deepEqual(
    await activeRepository.addForActiveSession({ ...distraction, text: '  记得回邮件  ' }),
    distraction,
  );
  assert.deepEqual(parameters[0], [
    distraction.id,
    distraction.sessionId,
    distraction.text,
    distraction.createdAt,
    distraction.sessionId,
  ]);

  const endedDatabase = {
    async runAsync() {
      return { changes: 0, lastInsertRowId: 0 };
    },
  } as unknown as SQLiteDatabase;
  const endedRepository = new SQLiteDistractionRepository(endedDatabase);
  await assert.rejects(
    () => endedRepository.addForActiveSession(distraction),
    ActiveSessionRequiredError,
  );
});
