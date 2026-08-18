import type { ReflectionInput, Session } from '../domain/session';
import { validateReflection } from '../domain/session';
import type { SessionRepository } from '../data/repositories/session-repository';
import { createId } from '../shared/id';

export class SessionService {
  constructor(private readonly repository: SessionRepository) {}

  async start(title: string, now = Date.now()): Promise<Session> {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) throw new Error('请输入想要沉浸的活动。');
    const active = await this.repository.getActive();
    if (active) return active;
    const session: Session = {
      id: createId('session'),
      title: normalizedTitle,
      startedAt: now,
      endedAt: null,
      immersionLevel: null,
      immersionDelayMinutes: null,
      endReason: null,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };
    return this.repository.create(session);
  }

  getActive(): Promise<Session | null> {
    return this.repository.getActive();
  }

  getById(id: string): Promise<Session | null> {
    return this.repository.getById(id);
  }

  end(id: string, now = Date.now()): Promise<Session | null> {
    return this.repository.end(id, now);
  }

  async saveReflection(id: string, input: ReflectionInput, now = Date.now()): Promise<Session> {
    const session = await this.repository.getById(id);
    if (!session || session.endedAt === null) throw new Error('只能为已结束的 session 保存反思。');
    const durationMs = session.endedAt - session.startedAt;
    const validationError = validateReflection(input, durationMs);
    if (validationError) throw new Error(validationError);
    const updated = await this.repository.updateReflection(id, input, now);
    if (!updated) throw new Error('保存反思失败，请稍后重试。');
    return updated;
  }
}
