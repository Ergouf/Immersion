import assert from 'node:assert/strict';
import test from 'node:test';

import { buildMergePlan, createBackup, parseAndValidateBackup, serializeBackup } from '../src/domain/backup';
import { calculateDurationMs, calculateSevenDaySummary, validateReflection, type Session } from '../src/domain/session';

const now = Date.UTC(2026, 0, 8, 12);
const baseSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session-1',
  title: '读书',
  startedAt: now - 60 * 60_000,
  endedAt: now,
  immersionLevel: null,
  immersionDelayMinutes: null,
  endReason: null,
  createdAt: now - 60 * 60_000,
  updatedAt: now,
  schemaVersion: 1,
  ...overrides,
});

test('duration uses wall-clock endpoints and rejects negative durations', () => {
  assert.equal(calculateDurationMs(baseSession()), 60 * 60_000);
  assert.equal(calculateDurationMs(baseSession({ endedAt: null }), now), 60 * 60_000);
  assert.equal(calculateDurationMs(baseSession({ startedAt: now, endedAt: now - 1 })), null);
});

test('reflection validation is nullable but bounded', () => {
  assert.equal(validateReflection({ immersionLevel: null, immersionDelayMinutes: null, endReason: null }, 60 * 60_000), null);
  assert.match(String(validateReflection({ immersionLevel: 4, immersionDelayMinutes: null, endReason: null }, 60 * 60_000)), /0 到 3/);
  assert.match(String(validateReflection({ immersionLevel: 2, immersionDelayMinutes: 61, endReason: null }, 60 * 60_000)), /范围/);
});

test('seven-day summary excludes active, invalid, and out-of-window sessions', () => {
  const sessions = [
    baseSession(),
    baseSession({ id: 'session-2', startedAt: now - 2 * 60 * 60_000, endedAt: now - 60 * 60_000 }),
    baseSession({ id: 'active', endedAt: null }),
    baseSession({ id: 'negative', startedAt: now, endedAt: now - 1 }),
    baseSession({ id: 'old', startedAt: now - 9 * 24 * 60 * 60_000, endedAt: now - 8 * 24 * 60 * 60_000 }),
  ];
  const summary = calculateSevenDaySummary(sessions, now);
  assert.equal(summary.count, 2);
  assert.equal(summary.totalDurationMs, 2 * 60 * 60_000);
  assert.equal(summary.averageDurationMs, 60 * 60_000);
});

test('backup round-trips and rejects unknown versions or broken foreign keys', () => {
  const session = baseSession();
  const backup = createBackup([session], [{ id: 'thought-1', sessionId: session.id, text: '记得回邮件', createdAt: now }], now);
  const parsed = parseAndValidateBackup(serializeBackup(backup));
  assert.equal(parsed.ok, true);
  const unknown = { ...backup, backupVersion: 2 };
  assert.equal(parseAndValidateBackup(JSON.stringify(unknown)).ok, false);
  const broken = { ...backup, distractions: [{ ...backup.distractions[0], sessionId: 'missing' }] };
  assert.equal(parseAndValidateBackup(JSON.stringify(broken)).ok, false);
  const tooLongDelay = { ...backup, sessions: [{ ...session, immersionDelayMinutes: 61 }] };
  assert.equal(parseAndValidateBackup(JSON.stringify(tooLongDelay)).ok, false);
});

test('merge plan is idempotent and stops on same-id content conflicts', () => {
  const session = baseSession();
  const distraction = { id: 'thought-1', sessionId: session.id, text: '记得回邮件', createdAt: now };
  const backup = createBackup([session], [distraction], now);
  const first = buildMergePlan([], [], backup);
  assert.equal('conflict' in first, false);
  if ('conflict' in first) return;
  assert.equal(first.sessionsToInsert.length, 1);
  const second = buildMergePlan([session], [distraction], backup);
  assert.equal('conflict' in second, false);
  if ('conflict' in second) return;
  assert.equal(second.sessionsToInsert.length, 0);
  assert.equal(second.skippedDistractions, 1);
  const reordered = JSON.parse(JSON.stringify(backup)) as typeof backup;
  reordered.sessions[0] = {
    schemaVersion: session.schemaVersion,
    updatedAt: session.updatedAt,
    createdAt: session.createdAt,
    endReason: session.endReason,
    immersionDelayMinutes: session.immersionDelayMinutes,
    immersionLevel: session.immersionLevel,
    endedAt: session.endedAt,
    startedAt: session.startedAt,
    title: session.title,
    id: session.id,
  };
  const reorderedPlan = buildMergePlan([session], [distraction], reordered);
  assert.equal('conflict' in reorderedPlan, false);
  if ('conflict' in reorderedPlan) return;
  assert.equal(reorderedPlan.skippedSessions, 1);
  const conflict = buildMergePlan([session], [], createBackup([{ ...session, title: '另一件事' }], [], now));
  assert.deepEqual(conflict, { conflict: 'session session-1 与本地内容冲突。' });
  const activeLocal = baseSession({ id: 'active-local', startedAt: now - 10_000, endedAt: null });
  const activeIncoming = baseSession({ id: 'active-incoming', startedAt: now - 10_000, endedAt: null });
  assert.deepEqual(buildMergePlan([activeLocal], [], createBackup([activeIncoming], [], now)), { conflict: '本地与备份各自存在不同的活动 session，导入已中止。' });
});
