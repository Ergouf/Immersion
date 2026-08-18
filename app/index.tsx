import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { SQLiteSessionRepository } from '../src/data/repositories/session-repository';
import { calculateDurationMs, formatDuration, type Session, type SevenDaySummary } from '../src/domain/session';
import { SessionService } from '../src/services/session-service';
import { AppInput, AppText, Card, InlineError, LoadingState, PrimaryButton, Screen, SectionTitle, Title } from '../src/ui/primitives';
import { spacing, typography, useAppColors } from '../src/theme/tokens';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useAppColors();
  const [title, setTitle] = useState('');
  const [active, setActive] = useState<Session | null>(null);
  const [summary, setSummary] = useState<SevenDaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const repository = new SQLiteSessionRepository(db);
      const [nextActive, nextSummary] = await Promise.all([repository.getActive(), repository.getSevenDaySummary()]);
      setActive(nextActive);
      setSummary(nextSummary);
      setError(null);
    } catch {
      setError('本地数据暂时无法读取，请稍后重试。');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const start = async () => {
    if (starting) return;
    setStarting(true);
    setError(null);
    try {
      const service = new SessionService(new SQLiteSessionRepository(db));
      const session = await service.start(title);
      setTitle('');
      router.push({ pathname: '/focus/[id]', params: { id: session.id } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '开始失败，请稍后重试。');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <LoadingState />;

  const activeDuration = active ? calculateDurationMs(active) ?? 0 : 0;
  return (
    <Screen scroll>
      <View style={styles.header}>
        <Title>Immersion</Title>
        <AppText muted style={styles.subtitle}>把注意力留给眼前的一件事。</AppText>
      </View>

      {active ? (
        <Card>
          <AppText muted>正在进行</AppText>
          <AppText style={styles.activeTitle}>{active.title}</AppText>
          <AppText muted>{formatDuration(activeDuration)}</AppText>
          <PrimaryButton onPress={() => router.push({ pathname: '/focus/[id]', params: { id: active.id } })}>恢复沉浸</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <SectionTitle>今天想沉浸于什么？</SectionTitle>
          <AppInput
            value={title}
            onChangeText={setTitle}
            placeholder="例如：读完这一章"
            returnKeyType="done"
            onSubmitEditing={() => void start()}
            accessibilityLabel="今天想沉浸于什么"
          />
          <View style={{ height: spacing.md }} />
          <PrimaryButton onPress={() => void start()} disabled={starting || title.trim().length === 0}>开始沉浸</PrimaryButton>
          {error ? <InlineError>{error}</InlineError> : null}
        </Card>
      )}

      {error && active ? <InlineError>{error}</InlineError> : null}

      <Card>
        <AppText muted>最近 7 天</AppText>
        <View style={styles.metrics}>
          <Metric value={String(summary?.count ?? 0)} label="次沉浸" />
          <Metric value={String(Math.round((summary?.totalDurationMs ?? 0) / 60_000))} label="总分钟" />
          <Metric value={formatDuration(summary?.averageDurationMs ?? 0)} label="平均时长" />
        </View>
      </Card>

      <View style={styles.links}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/history')} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}>
          <AppText style={{ color: colors.accent }}>查看历史</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/backup')} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}>
          <AppText style={{ color: colors.accent }}>数据迁移</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  const colors = useAppColors();
  return <View style={styles.metric}><AppText style={{ color: colors.text, fontWeight: '700', fontSize: 20 }}>{value}</AppText><AppText muted style={typography.small}>{label}</AppText></View>;
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  subtitle: { marginTop: spacing.sm },
  activeTitle: { ...typography.heading, marginVertical: spacing.sm },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  metric: { flex: 1, gap: spacing.xs },
  links: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xs, paddingVertical: spacing.md },
});
