export const END_REASONS = [
  'completed',
  'time_reached',
  'external_interruption',
  'voluntary_switch',
  'fatigue',
  'other',
] as const;

export type EndReason = (typeof END_REASONS)[number];

export type Session = {
  id: string;
  title: string;
  startedAt: number;
  endedAt: number | null;
  immersionLevel: number | null;
  immersionDelayMinutes: number | null;
  endReason: EndReason | null;
  createdAt: number;
  updatedAt: number;
  schemaVersion: number;
};

export type ReflectionInput = {
  immersionLevel: number | null;
  immersionDelayMinutes: number | null;
  endReason: EndReason | null;
};

export type SevenDaySummary = {
  count: number;
  totalDurationMs: number;
  averageDurationMs: number;
};

export function isEndReason(value: unknown): value is EndReason {
  return typeof value === 'string' && END_REASONS.includes(value as EndReason);
}

export function calculateDurationMs(
  session: Pick<Session, 'startedAt' | 'endedAt'>,
  now = Date.now(),
): number | null {
  if (!Number.isInteger(session.startedAt) || session.startedAt < 0) return null;
  const end = session.endedAt ?? now;
  if (!Number.isInteger(end) || end < session.startedAt) return null;
  return end - session.startedAt;
}

export function formatDuration(durationMs: number): string {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}小时 ${String(minutes).padStart(2, '0')}分`;
  return `${minutes}分钟`;
}

export function validateReflection(
  reflection: ReflectionInput,
  sessionDurationMs: number,
): string | null {
  if (
    reflection.immersionLevel !== null &&
    (!Number.isInteger(reflection.immersionLevel) ||
      reflection.immersionLevel < 0 ||
      reflection.immersionLevel > 3)
  ) {
    return '沉浸程度必须是 0 到 3。';
  }

  if (
    reflection.immersionDelayMinutes !== null &&
    (!Number.isInteger(reflection.immersionDelayMinutes) ||
      reflection.immersionDelayMinutes < 0 ||
      reflection.immersionDelayMinutes > Math.ceil(sessionDurationMs / 60_000))
  ) {
    return '进入状态时间必须是本次时长范围内的非负整数。';
  }

  if (reflection.endReason !== null && !isEndReason(reflection.endReason)) {
    return '结束原因无效。';
  }

  return null;
}

export function calculateSevenDaySummary(
  sessions: readonly Session[],
  now = Date.now(),
): SevenDaySummary {
  const windowStart = now - 7 * 24 * 60 * 60 * 1000;
  const durations = sessions
    .filter((session) => session.endedAt !== null)
    .filter((session) => (session.endedAt ?? 0) >= windowStart && (session.endedAt ?? 0) <= now)
    .map((session) => calculateDurationMs(session, now))
    .filter((duration): duration is number => duration !== null);

  const totalDurationMs = durations.reduce((total, duration) => total + duration, 0);
  return {
    count: durations.length,
    totalDurationMs,
    averageDurationMs: durations.length === 0 ? 0 : totalDurationMs / durations.length,
  };
}
