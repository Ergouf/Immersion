import type { BackupRepository, ImportResult } from '../data/repositories/backup-repository';
import { createBackup, parseAndValidateBackup, serializeBackup, type ImmersionBackupV1 } from '../domain/backup';

export class BackupService {
  constructor(private readonly repository: BackupRepository) {}

  async create(): Promise<{ backup: ImmersionBackupV1; json: string }> {
    const snapshot = await this.repository.snapshot();
    const backup = createBackup(snapshot.sessions, snapshot.distractions);
    return { backup, json: serializeBackup(backup) };
  }

  async validate(json: string): Promise<ReturnType<typeof parseAndValidateBackup>> {
    return parseAndValidateBackup(json);
  }

  async merge(json: string): Promise<ImportResult> {
    const parsed = parseAndValidateBackup(json);
    if (!parsed.ok) throw new Error(parsed.error);
    return this.repository.merge(parsed.value);
  }
}
