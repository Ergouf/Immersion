import type { SQLiteDatabase } from 'expo-sqlite';

import { normalizeDistractionText, type Distraction } from '../../domain/distraction';

type DistractionRow = {
  id: string;
  session_id: string;
  text: string;
  created_at: number;
};

function fromRow(row: DistractionRow): Distraction {
  return { id: row.id, sessionId: row.session_id, text: row.text, createdAt: row.created_at };
}

export class ActiveSessionRequiredError extends Error {
  constructor() {
    super('当前没有可记录念头的活动 session。');
    this.name = 'ActiveSessionRequiredError';
  }
}

export interface DistractionRepository {
  addForActiveSession(distraction: Distraction): Promise<Distraction>;
  listBySession(sessionId: string): Promise<Distraction[]>;
  listAll(): Promise<Distraction[]>;
}

export class SQLiteDistractionRepository implements DistractionRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async addForActiveSession(distraction: Distraction): Promise<Distraction> {
    const text = normalizeDistractionText(distraction.text);
    if (!text) throw new Error('念头内容不能为空。');
    const result = await this.db.runAsync(
      `INSERT INTO distractions (id, session_id, text, created_at)
       SELECT ?, ?, ?, ?
       WHERE EXISTS (
         SELECT 1 FROM sessions WHERE id = ? AND ended_at IS NULL
       )`,
      distraction.id,
      distraction.sessionId,
      text,
      distraction.createdAt,
      distraction.sessionId,
    );
    if (result.changes === 0) throw new ActiveSessionRequiredError();
    return { ...distraction, text };
  }

  async listBySession(sessionId: string): Promise<Distraction[]> {
    const rows = await this.db.getAllAsync<DistractionRow>(
      'SELECT * FROM distractions WHERE session_id = ? ORDER BY created_at ASC',
      sessionId,
    );
    return rows.map(fromRow);
  }

  async listAll(): Promise<Distraction[]> {
    const rows = await this.db.getAllAsync<DistractionRow>('SELECT * FROM distractions ORDER BY created_at ASC');
    return rows.map(fromRow);
  }
}
