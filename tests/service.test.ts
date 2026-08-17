import assert from 'node:assert/strict';
import test from 'node:test';

import type { ReflectionInput, Session, SevenDaySummary } from '../src/domain/session';
import { SessionService } from '../src/services/session-service';
import type { SessionRepository } from '../src/data/repositories/session-repository';

class FakeSessionRepository implements SessionRepository {
  sessions: Session[] = [];

  async getActive() { return this.sessions.find((session) => session.endedAt === null) ?? null; }
  async getById(id: string) { return this.sessions.find((session) => session.id === id) ?? null; }
  async create(session: Session) { this.sessions.push(session); return session; }
  async end(id: string, endedAt: number) {
    const session = await this.getById(id);
    if (!session) return null;
    session.endedAt = Math.max(session.startedAt, endedAt);
    session.updatedAt = endedAt;
    return session;
  }
  async updateReflection(id: string, reflection: ReflectionInput, updatedAt: number) {
    const session = await this.getById(id);
    if (!session) return null;
    Object.assign(session, reflection, { updatedAt });
    return session;
  }
  async listCompleted() { return this.sessions.filter((session) => session.endedAt !== null); }
  async listAll() { return this.sessions; }
  async getSevenDaySummary(): Promise<SevenDaySummary> { return { count: 0, totalDurationMs: 0, averageDurationMs: 0 }; }
}

test('session service starts once and returns the existing active session', async () => {
  const repository = new FakeSessionRepository();
  const service = new SessionService(repository);
  const first = await service.start('  写作  ', 1000);
  const second = await service.start('另一件事', 2000);
  assert.equal(first.id, second.id);
  assert.equal(repository.sessions.length, 1);
  assert.equal(first.title, '写作');
});

test('session service rejects blank titles and persists end before review', async () => {
  const repository = new FakeSessionRepository();
  const service = new SessionService(repository);
  await assert.rejects(() => service.start('   '), /请输入/);
  const session = await service.start('阅读', 1000);
  const ended = await service.end(session.id, 61_000);
  assert.equal(ended?.endedAt, 61_000);
  assert.equal((await service.getActive()), null);
});

test('session service keeps reflection bounded by the persisted duration', async () => {
  const repository = new FakeSessionRepository();
  const service = new SessionService(repository);
  const session = await service.start('练琴', 1000);
  await service.end(session.id, 61_000);
  await assert.rejects(() => service.saveReflection(session.id, { immersionLevel: 4, immersionDelayMinutes: null, endReason: null }), /0 到 3/);
  const saved = await service.saveReflection(session.id, { immersionLevel: 3, immersionDelayMinutes: 1, endReason: 'completed' }, 62_000);
  assert.equal(saved.immersionLevel, 3);
  assert.equal(saved.endReason, 'completed');
});
