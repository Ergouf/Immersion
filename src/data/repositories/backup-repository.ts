import type { SQLiteDatabase } from 'expo-sqlite';

import { buildMergePlan, type ImmersionBackupV1 } from '../../domain/backup';
import type { Distraction } from '../../domain/distraction';
import type { Session } from '../../domain/session';

export type ImportResult = {
  insertedSessions: number;
  insertedDistractions: number;
  skippedSessions: number;
  skippedDistractions: number;
};

type SessionRow = {
  id: string;
  title: string;
  started_at: number;
  ended_at: number | null;
  immersion_level: number | null;
  immersion_delay_minutes: number | null;
  end_reason: Session['endReason'];
  created_at: number;
  updated_at: number;
  schema_version: number;
};

type DistractionRow = { id: string; session_id: string; text: string; created_at: number };

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    title: row.title,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    immersionLevel: row.immersion_level,
    immersionDelayMinutes: row.immersion_delay_minutes,
    endReason: row.end_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    schemaVersion: row.schema_version,
  };
}

function toDistraction(row: DistractionRow): Distraction {
  return { id: row.id, sessionId: row.session_id, text: row.text, createdAt: row.created_at };
}

export class BackupRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async snapshot(): Promise<{ sessions: Session[]; distractions: Distraction[] }> {
    let snapshot: { sessions: Session[]; distractions: Distraction[] } | undefined;
    await this.db.withExclusiveTransactionAsync(async (transaction) => {
      const sessions = await transaction.getAllAsync<SessionRow>('SELECT * FROM sessions ORDER BY started_at ASC');
      const distractions = await transaction.getAllAsync<DistractionRow>(
        'SELECT * FROM distractions ORDER BY created_at ASC',
      );
      snapshot = { sessions: sessions.map(toSession), distractions: distractions.map(toDistraction) };
    });
    if (!snapshot) throw new Error('无法创建一致的数据快照。');
    return snapshot;
  }

  async merge(backup: ImmersionBackupV1): Promise<ImportResult> {
    let result: ImportResult | undefined;
    await this.db.withExclusiveTransactionAsync(async (transaction) => {
      const sessionRows = await transaction.getAllAsync<SessionRow>(
        'SELECT * FROM sessions ORDER BY started_at ASC',
      );
      const distractionRows = await transaction.getAllAsync<DistractionRow>(
        'SELECT * FROM distractions ORDER BY created_at ASC',
      );
      const plan = buildMergePlan(
        sessionRows.map(toSession),
        distractionRows.map(toDistraction),
        backup,
      );
      if ('conflict' in plan) throw new Error(plan.conflict);

      for (const session of plan.sessionsToInsert) {
        await transaction.runAsync(
          `INSERT INTO sessions
           (id, title, started_at, ended_at, immersion_level, immersion_delay_minutes, end_reason, created_at, updated_at, schema_version)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          session.id,
          session.title,
          session.startedAt,
          session.endedAt,
          session.immersionLevel,
          session.immersionDelayMinutes,
          session.endReason,
          session.createdAt,
          session.updatedAt,
          session.schemaVersion,
        );
      }
      for (const distraction of plan.distractionsToInsert) {
        await transaction.runAsync(
          'INSERT INTO distractions (id, session_id, text, created_at) VALUES (?, ?, ?, ?)',
          distraction.id,
          distraction.sessionId,
          distraction.text,
          distraction.createdAt,
        );
      }
      result = {
        insertedSessions: plan.sessionsToInsert.length,
        insertedDistractions: plan.distractionsToInsert.length,
        skippedSessions: plan.skippedSessions,
        skippedDistractions: plan.skippedDistractions,
      };
    });
    if (!result) throw new Error('导入事务未完成。');
    return result;
  }
}
