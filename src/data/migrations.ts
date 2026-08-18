import type { SQLiteDatabase } from 'expo-sqlite';

export const LATEST_SCHEMA_VERSION = 1;

async function ensureSingleActiveSession(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM sessions WHERE ended_at IS NULL',
  );
  if ((row?.count ?? 0) > 1) {
    throw new Error('数据库中存在多个活动 session，已停止迁移以保护现有数据。');
  }
  // A normal UNIQUE index treats NULL values as distinct. Indexing the constant
  // boolean expression makes the partial index enforce one active row.
  await db.execAsync(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_one_active ON sessions ((ended_at IS NULL)) WHERE ended_at IS NULL;',
  );
}

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion > LATEST_SCHEMA_VERSION) {
    throw new Error(
      `数据库版本 ${currentVersion} 高于当前支持的 ${LATEST_SCHEMA_VERSION}。请更新 App；原数据未被修改。`,
    );
  }

  if (currentVersion === LATEST_SCHEMA_VERSION) {
    await ensureSingleActiveSession(db);
    return;
  }

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        immersion_level INTEGER,
        immersion_delay_minutes INTEGER,
        end_reason TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        schema_version INTEGER NOT NULL DEFAULT 1
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(ended_at);
      CREATE INDEX IF NOT EXISTS idx_sessions_ended_at ON sessions(ended_at DESC);
      CREATE TABLE IF NOT EXISTS distractions (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_distractions_session ON distractions(session_id, created_at);
      PRAGMA user_version = ${LATEST_SCHEMA_VERSION};
    `);
    await ensureSingleActiveSession(db);
  });
}
