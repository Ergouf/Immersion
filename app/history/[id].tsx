import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SQLiteDistractionRepository } from '../../src/data/repositories/distraction-repository';
import { SQLiteSessionRepository } from '../../src/data/repositories/session-repository';
import { calculateDurationMs, formatDuration, type Session } from '../../src/domain/session';
import type { Distraction } from '../../src/domain/distraction';
import { AppText, Card, Divider, InlineError, LoadingState, Screen, SectionTitle } from '../../src/ui/primitives';
import { spacing, typography } from '../../src/theme/tokens';

const reasons: Record<string, string> = { completed: '完成了计划', time_reached: '时间到了', external_interruption: '外部打断', voluntary_switch: '主动切换', fatigue: '感到疲劳', other: '其他' };

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Array.isArray(id) ? id[0] : id;
  const db = useSQLiteContext();
  const [session, setSession] = useState<Session | null>(null);
  const [distractions, setDistractions] = useState<Distraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!sessionId) { setLoading(false); setError('找不到这条记录。'); return; }
    void Promise.all([new SQLiteSessionRepository(db).getById(sessionId), new SQLiteDistractionRepository(db).listBySession(sessionId)]).then(([nextSession, nextDistractions]) => { setSession(nextSession); setDistractions(nextDistractions); }).catch(() => setError('记录暂时无法读取。')).finally(() => setLoading(false));
  }, [db, sessionId]);
  if (loading) return <LoadingState />;
  if (!session) return <Screen><SectionTitle>找不到这条记录</SectionTitle>{error ? <InlineError>{error}</InlineError> : null}</Screen>;
  const duration = calculateDurationMs(session) ?? 0;
  return <Screen scroll>
    <SectionTitle>{session.title}</SectionTitle>
    <AppText muted>{new Date(session.startedAt).toLocaleString()} — {session.endedAt ? new Date(session.endedAt).toLocaleString() : '进行中'}</AppText>
    <AppText style={styles.duration}>{formatDuration(duration)}</AppText>
    <Card><Field label="沉浸程度" value={session.immersionLevel === null ? '未填写' : `${session.immersionLevel}/3`} /><Field label="进入状态" value={session.immersionDelayMinutes === null ? '未填写' : `${session.immersionDelayMinutes} 分钟`} /><Field label="结束原因" value={session.endReason ? reasons[session.endReason] : '未填写'} /></Card>
    <Card><AppText style={styles.heading}>暂存的念头（{distractions.length}）</AppText>{distractions.length === 0 ? <AppText muted style={styles.empty}>本次没有暂存念头。</AppText> : distractions.map((item) => <View key={item.id}><Divider /><AppText>{item.text}</AppText><AppText muted style={[typography.small, styles.thoughtTime]}>{new Date(item.createdAt).toLocaleTimeString()}</AppText></View>)}</Card>
  </Screen>;
}

function Field({ label, value }: { label: string; value: string }) { return <View style={styles.field}><AppText muted>{label}</AppText><AppText>{value}</AppText></View>; }

const styles = StyleSheet.create({ duration: { fontSize: 40, lineHeight: 50, fontWeight: '400', letterSpacing: -0.8, marginTop: spacing.md, marginBottom: spacing.lg }, heading: { fontSize: 18, fontWeight: '500' }, field: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, gap: spacing.md }, empty: { marginTop: spacing.md }, thoughtTime: { marginTop: spacing.xs }, });
