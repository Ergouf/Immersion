import type { SQLiteDatabase } from 'expo-sqlite';

import type { ReflectionInput, Session, SevenDaySummary } from '../../domain/session';
import { calculateDurationMs, calculateSevenDaySummary } from '../../domain/session';

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

function fromRow(row: SessionRow): Session {
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

export interface SessionRepository {
  getActive(): Promise<Session | null>;
  getById(id: string): Promise<Session | null>;
  create(session: Session): Promise<Session>;
  end(id: string, endedAt: number): Promise<Session | null>;
  updateReflection(id: string, reflection: ReflectionInput, updatedAt: number): Promise<Session | null>;
  listCompleted(limit?: number): Promise<Session[]>;
  listAll(): Promise<Session[]>;
  getSevenDaySummary(now?: number): Promise<SevenDaySummary>;
}

export class SQLiteSessionRepository implements SessionRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getActive(): Promise<Session | null> {
    const row = await this.db.getFirstAsync<SessionRow>(
      `SELECT * FROM sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1`,
    );
    return row ? fromRow(row) : null;
  }

  async getById(id: string): Promise<Session | null> {
    const row = await this.db.getFirstAsync<SessionRow>('SELECT * FROM sessions WHERE id = ?', id);
    return row ? fromRow(row) : null;
  }

  async create(session: Session): Promise<Session> {
    const existingActive = await this.getActive();
    if (existingActive) return existingActive;
    try {
      await this.db.runAsync(
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
    } catch (cause) {
      // The partial unique index is the final concurrency guard. If another
      // start won the race, resume it instead of surfacing a duplicate-start
      // error; unrelated database failures still propagate.
      const racedActive = await this.getActive();
      if (racedActive) return racedActive;
      throw cause;
    }
    return session;
  }

  async end(id: string, endedAt: number): Promise<Session | null> {
    const session = await this.getById(id);
    if (!session) return null;
    if (session.endedAt !== null) return session;
    const safeEndedAt = Math.max(session.startedAt, endedAt);
    await this.db.runAsync('UPDATE sessions SET ended_at = ?, updated_at = ? WHERE id = ? AND ended_at IS NULL', safeEndedAt, safeEndedAt, id);
    return this.getById(id);
  }

  async updateReflection(id: string, reflection: ReflectionInput, updatedAt: number): Promise<Session | null> {
    await this.db.runAsync(
      `UPDATE sessions
       SET immersion_level = ?, immersion_delay_minutes = ?, end_reason = ?, updated_at = ?
       WHERE id = ? AND ended_at IS NOT NULL`,
      reflection.immersionLevel,
      reflection.immersionDelayMinutes,
      reflection.endReason,
      updatedAt,
      id,
    );
    return this.getById(id);
  }

  async listCompleted(limit = 100): Promise<Session[]> {
    const rows = await this.db.getAllAsync<SessionRow>(
      `SELECT * FROM sessions WHERE ended_at IS NOT NULL ORDER BY ended_at DESC LIMIT ?`,
      Math.max(1, Math.floor(limit)),
    );
    return rows.map(fromRow);
  }

  async listAll(): Promise<Session[]> {
    const rows = await this.db.getAllAsync<SessionRow>('SELECT * FROM sessions ORDER BY started_at ASC');
    return rows.map(fromRow);
  }

  async getSevenDaySummary(now = Date.now()): Promise<SevenDaySummary> {
    return calculateSevenDaySummary(await this.listAll(), now);
  }
}

export function isValidCompletedSession(session: Session, now = Date.now()): boolean {
  return session.endedAt !== null && calculateDurationMs(session, now) !== null;
}
