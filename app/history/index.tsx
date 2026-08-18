import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SQLiteSessionRepository } from '../../src/data/repositories/session-repository';
import { calculateDurationMs, formatDuration, type Session } from '../../src/domain/session';
import { AppText, Card, InlineError, LoadingState, Screen } from '../../src/ui/primitives';
import { spacing, typography, useAppColors } from '../../src/theme/tokens';

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useAppColors();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { setSessions(await new SQLiteSessionRepository(db).listCompleted()); setError(null); }
    catch { setError('历史记录暂时无法读取。'); }
    finally { setLoading(false); }
  }, [db]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  if (loading) return <LoadingState label="正在读取历史…" />;
  return <Screen scroll>
    <AppText muted>已结束的沉浸，最近优先。</AppText>
    {error ? <InlineError>{error}</InlineError> : null}
    {sessions.length === 0 ? <Card><AppText>还没有完成的沉浸记录。</AppText><AppText muted style={{ marginTop: spacing.xs }}>完成一次沉浸后，它会安静地出现在这里。</AppText></Card> : sessions.map((session) => <HistoryCard key={session.id} session={session} onPress={() => router.push({ pathname: '/history/[id]', params: { id: session.id } })} colors={colors} />)}
  </Screen>;
}

function HistoryCard({ session, onPress, colors }: { session: Session; onPress: () => void; colors: ReturnType<typeof useAppColors> }) {
  const endedAt = session.endedAt ? new Date(session.endedAt).toLocaleString() : '进行中';
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.45 : 1 })}><Card><View style={styles.row}><View style={{ flex: 1 }}><AppText style={styles.itemTitle}>{session.title}</AppText><AppText muted style={[typography.small, styles.date]}>{endedAt}</AppText></View><View style={styles.right}><AppText style={{ color: colors.text, fontSize: 18 }}>{formatDuration(calculateDurationMs(session) ?? 0)}</AppText>{session.immersionLevel === null ? <AppText muted style={typography.small}>未评分</AppText> : <AppText muted style={typography.small}>沉浸 {session.immersionLevel}/3</AppText>}</View></View></Card></Pressable>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.md }, itemTitle: { fontSize: 18, fontWeight: '500' }, date: { marginTop: spacing.xs }, right: { alignItems: 'flex-end', gap: spacing.xs } });
