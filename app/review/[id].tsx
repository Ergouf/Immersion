import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SQLiteSessionRepository } from '../../src/data/repositories/session-repository';
import { END_REASONS, calculateDurationMs, formatDuration, type EndReason, type Session } from '../../src/domain/session';
import { SessionService } from '../../src/services/session-service';
import { AppInput, AppText, Card, InlineError, LoadingState, PrimaryButton, Screen, SectionTitle } from '../../src/ui/primitives';
import { spacing, typography, useAppColors } from '../../src/theme/tokens';

const END_REASON_LABELS: Record<EndReason, string> = {
  completed: '完成了计划',
  time_reached: '时间到了',
  external_interruption: '外部打断',
  voluntary_switch: '主动切换',
  fatigue: '感到疲劳',
  other: '其他',
};

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Array.isArray(id) ? id[0] : id;
  const db = useSQLiteContext();
  const router = useRouter();
  const service = useMemo(() => new SessionService(new SQLiteSessionRepository(db)), [db]);
  const [session, setSession] = useState<Session | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [delayText, setDelayText] = useState('');
  const [reason, setReason] = useState<EndReason | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setLoading(false); setError('找不到这次沉浸。'); return; }
    void service.getById(sessionId).then((next) => {
      setSession(next);
      if (next) { setLevel(next.immersionLevel); setDelayText(next.immersionDelayMinutes === null ? '' : String(next.immersionDelayMinutes)); setReason(next.endReason); }
    }).catch(() => setError('这次记录暂时无法读取。')).finally(() => setLoading(false));
  }, [sessionId, service]);

  const save = async () => {
    if (!session || saving) return;
    setSaving(true); setError(null);
    const delay = delayText.trim() === '' ? null : Number(delayText);
    try {
      await service.saveReflection(session.id, { immersionLevel: level, immersionDelayMinutes: delay, endReason: reason });
      router.replace('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '保存失败，选择内容仍保留。');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingState />;
  if (!session) return <Screen><SectionTitle>无法读取记录</SectionTitle>{error ? <InlineError>{error}</InlineError> : null}</Screen>;
  const duration = calculateDurationMs(session) ?? 0;
  return (
    <Screen scroll>
      <AppText muted>本次沉浸</AppText>
      <SectionTitle>{session.title}</SectionTitle>
      <AppText style={styles.duration}>{formatDuration(duration)}</AppText>
      <Card>
        <AppText style={styles.question}>这次有多沉浸？</AppText>
        <View style={styles.choiceRow}>
          {[0, 1, 2, 3].map((value) => <Choice key={value} label={String(value)} selected={level === value} onPress={() => setLevel(value)} />)}
        </View>
        <AppText muted style={styles.legend}>0 完全没有 · 1 偶尔进入 · 2 明显沉浸 · 3 深度沉浸</AppText>
      </Card>
      <Card>
        <AppText style={styles.question}>大约多久进入状态？（分钟，可跳过）</AppText>
        <AppInput value={delayText} onChangeText={setDelayText} keyboardType="number-pad" placeholder="例如 5" accessibilityLabel="进入状态所需分钟数" />
      </Card>
      <Card>
        <AppText style={styles.question}>为什么结束？（可跳过）</AppText>
        <View style={styles.reasonList}>{END_REASONS.map((value) => <ReasonChoice key={value} label={END_REASON_LABELS[value]} selected={reason === value} onPress={() => setReason(reason === value ? null : value)} />)}</View>
      </Card>
      {error ? <InlineError>{error}</InlineError> : null}
      <PrimaryButton onPress={() => void save()} disabled={saving}>完成</PrimaryButton>
    </Screen>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useAppColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={`沉浸程度 ${label}`} accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, { borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.accent : colors.surface }]}><AppText style={{ color: selected ? colors.accentText : colors.text, fontWeight: '700', textAlign: 'center' }}>{label}</AppText></Pressable>;
}

function ReasonChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useAppColors();
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.reason, { borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.surfaceMuted : colors.surface }]}><AppText>{label}</AppText></Pressable>;
}

const styles = StyleSheet.create({
  duration: { ...typography.heading, marginTop: spacing.sm, marginBottom: spacing.lg },
  question: { fontWeight: '700', marginBottom: spacing.md },
  choiceRow: { flexDirection: 'row', gap: spacing.sm },
  choice: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  legend: { marginTop: spacing.md },
  reasonList: { gap: spacing.sm },
  reason: { minHeight: 44, borderWidth: 1, borderRadius: 12, justifyContent: 'center', paddingHorizontal: spacing.md },
});
