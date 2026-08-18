import { END_REASONS, isEndReason, type Session } from './session';
import type { Distraction } from './distraction';

export const BACKUP_FORMAT = 'immersion-backup' as const;
export const BACKUP_VERSION = 1 as const;
export const DATABASE_SCHEMA_VERSION = 1 as const;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export type ImmersionBackupV1 = {
  format: typeof BACKUP_FORMAT;
  backupVersion: typeof BACKUP_VERSION;
  exportedAt: number;
  databaseSchemaVersion: typeof DATABASE_SCHEMA_VERSION;
  sessions: Session[];
  distractions: Distraction[];
};

export type BackupValidationResult =
  | { ok: true; value: ImmersionBackupV1 }
  | { ok: false; error: string };

export type MergePlan = {
  sessionsToInsert: Session[];
  distractionsToInsert: Distraction[];
  skippedSessions: number;
  skippedDistractions: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIntegerOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isInteger(value));
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    typeof value.startedAt === 'number' &&
    Number.isInteger(value.startedAt) &&
    value.startedAt >= 0 &&
    isIntegerOrNull(value.endedAt) &&
    (value.endedAt === null || value.endedAt >= value.startedAt) &&
    isIntegerOrNull(value.immersionLevel) &&
    (value.immersionLevel === null || (value.immersionLevel >= 0 && value.immersionLevel <= 3)) &&
    isIntegerOrNull(value.immersionDelayMinutes) &&
    (value.immersionDelayMinutes === null || value.immersionDelayMinutes >= 0) &&
    (value.endReason === null || isEndReason(value.endReason)) &&
    typeof value.createdAt === 'number' &&
    Number.isInteger(value.createdAt) &&
    typeof value.updatedAt === 'number' &&
    Number.isInteger(value.updatedAt) &&
    value.schemaVersion === 1
  );
}

function isDistraction(value: unknown): value is Distraction {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.sessionId === 'string' &&
    value.sessionId.length > 0 &&
    typeof value.text === 'string' &&
    value.text.trim().length > 0 &&
    typeof value.createdAt === 'number' &&
    Number.isInteger(value.createdAt) &&
    value.createdAt >= 0
  );
}

function hasUniqueIds(values: readonly { id: string }[]): boolean {
  return new Set(values.map((value) => value.id)).size === values.length;
}

function utf8Bytes(value: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value).length;
  return unescape(encodeURIComponent(value)).length;
}

export function createBackup(
  sessions: readonly Session[],
  distractions: readonly Distraction[],
  exportedAt = Date.now(),
): ImmersionBackupV1 {
  return {
    format: BACKUP_FORMAT,
    backupVersion: BACKUP_VERSION,
    exportedAt,
    databaseSchemaVersion: DATABASE_SCHEMA_VERSION,
    sessions: [...sessions],
    distractions: [...distractions],
  };
}

export function serializeBackup(backup: ImmersionBackupV1): string {
  return JSON.stringify(backup, null, 2);
}

export function validateBackup(input: unknown, serialized?: string): BackupValidationResult {
  if (serialized !== undefined && utf8Bytes(serialized) > MAX_BACKUP_BYTES) {
    return { ok: false, error: '备份文件超过 5 MB 上限。' };
  }
  if (!isRecord(input)) return { ok: false, error: '备份必须是 JSON 对象。' };
  if (input.format !== BACKUP_FORMAT) return { ok: false, error: '不是 Immersion 备份文件。' };
  if (input.backupVersion !== BACKUP_VERSION) {
    return { ok: false, error: '备份版本不受当前 App 支持。' };
  }
  if (input.databaseSchemaVersion !== DATABASE_SCHEMA_VERSION) {
    return { ok: false, error: '数据库版本不受当前 App 支持。' };
  }
  if (!Number.isInteger(input.exportedAt) || !Array.isArray(input.sessions) || !Array.isArray(input.distractions)) {
    return { ok: false, error: '备份缺少必要字段。' };
  }
  if (!input.sessions.every(isSession) || !input.distractions.every(isDistraction)) {
    return { ok: false, error: '备份中包含无效数据。' };
  }
  if (input.sessions.filter((session) => session.endedAt === null).length > 1) {
    return { ok: false, error: '备份中存在多个活动 session。' };
  }
  if (
    input.sessions.some(
      (session) =>
        session.immersionDelayMinutes !== null &&
        session.endedAt !== null &&
        session.immersionDelayMinutes > Math.ceil((session.endedAt - session.startedAt) / 60_000),
    )
  ) {
    return { ok: false, error: '备份中的进入状态时间超出 session 时长。' };
  }
  if (!hasUniqueIds(input.sessions) || !hasUniqueIds(input.distractions)) {
    return { ok: false, error: '备份中存在重复 ID。' };
  }
  const sessionIds = new Set(input.sessions.map((session) => session.id));
  if (input.distractions.some((distraction) => !sessionIds.has(distraction.sessionId))) {
    return { ok: false, error: '备份中的念头引用了不存在的 session。' };
  }
  return { ok: true, value: input as ImmersionBackupV1 };
}

export function parseAndValidateBackup(serialized: string): BackupValidationResult {
  if (utf8Bytes(serialized) > MAX_BACKUP_BYTES) return { ok: false, error: '备份文件超过 5 MB 上限。' };
  try {
    return validateBackup(JSON.parse(serialized), serialized);
  } catch {
    return { ok: false, error: '备份文件不是有效 JSON。' };
  }
}

function sameSession(a: Session, b: Session): boolean {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.startedAt === b.startedAt &&
    a.endedAt === b.endedAt &&
    a.immersionLevel === b.immersionLevel &&
    a.immersionDelayMinutes === b.immersionDelayMinutes &&
    a.endReason === b.endReason &&
    a.createdAt === b.createdAt &&
    a.updatedAt === b.updatedAt &&
    a.schemaVersion === b.schemaVersion
  );
}

function sameDistraction(a: Distraction, b: Distraction): boolean {
  return a.id === b.id && a.sessionId === b.sessionId && a.text === b.text && a.createdAt === b.createdAt;
}

export function buildMergePlan(
  localSessions: readonly Session[],
  localDistractions: readonly Distraction[],
  backup: ImmersionBackupV1,
): MergePlan | { conflict: string } {
  const sessionMap = new Map(localSessions.map((session) => [session.id, session]));
  const distractionMap = new Map(localDistractions.map((distraction) => [distraction.id, distraction]));
  const sessionsToInsert: Session[] = [];
  const distractionsToInsert: Distraction[] = [];
  let skippedSessions = 0;
  let skippedDistractions = 0;

  const localActive = localSessions.find((session) => session.endedAt === null);
  const incomingActive = backup.sessions.find((session) => session.endedAt === null);
  if (localActive && incomingActive && localActive.id !== incomingActive.id) {
    return { conflict: '本地与备份各自存在不同的活动 session，导入已中止。' };
  }

  for (const session of backup.sessions) {
    const local = sessionMap.get(session.id);
    if (!local) sessionsToInsert.push(session);
    else if (sameSession(local, session)) skippedSessions += 1;
    else return { conflict: `session ${session.id} 与本地内容冲突。` };
  }
  for (const distraction of backup.distractions) {
    const local = distractionMap.get(distraction.id);
    if (!local) distractionsToInsert.push(distraction);
    else if (sameDistraction(local, distraction)) skippedDistractions += 1;
    else return { conflict: `distraction ${distraction.id} 与本地内容冲突。` };
  }
  return { sessionsToInsert, distractionsToInsert, skippedSessions, skippedDistractions };
}

export const END_REASON_VALUES = END_REASONS;
