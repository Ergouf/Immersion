import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { SQLiteSessionRepository } from '../src/data/repositories/session-repository';
import { calculateDurationMs, formatDuration, type Session, type SevenDaySummary } from '../src/domain/session';
import { SessionService } from '../src/services/session-service';

const palette = {
  background: '#FFFFFF',
  text: '#242120',
  secondary: '#686463',
  line: '#817D7B',
  error: '#9A4239',
} as const;

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      const [nextActive, nextSummary] = await Promise.all([
        repository.getActive(),
        repository.getSevenDaySummary(),
      ]);
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
    if (starting || title.trim().length === 0) return;
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

  if (loading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ActivityIndicator color={palette.text} />
        <Text style={styles.loadingText}>正在准备…</Text>
      </View>
    );
  }

  const totalMinutes = Math.round((summary?.totalDurationMs ?? 0) / 60_000);
  const averageMinutes = Math.round((summary?.averageDurationMs ?? 0) / 60_000);
  const activeDuration = active ? calculateDurationMs(active) ?? 0 : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top + 22, 48), paddingBottom: Math.max(insets.bottom + 82, 98) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Immersion</Text>
          <Text style={styles.subtitle}>要把注意力留给眼前的一件事。</Text>
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.sectionTitle}>{active ? '正在沉浸' : '今天的目标'}</Text>

          {active ? (
            <>
              <View style={styles.activeRow}>
                <View style={styles.activeCopy}>
                  <Text style={styles.activeTitle} numberOfLines={2}>{active.title}</Text>
                  <Text style={styles.activeDuration}>{formatDuration(activeDuration)}</Text>
                </View>
              </View>
              <ActionButton
                label="恢复沉浸"
                onPress={() => router.push({ pathname: '/focus/[id]', params: { id: active.id } })}
              />
            </>
          ) : (
            <>
              <TextInput
                accessibilityLabel="今天的目标"
                onChangeText={setTitle}
                onSubmitEditing={() => void start()}
                placeholder="例如：读完这一章"
                placeholderTextColor={palette.secondary}
                returnKeyType="done"
                selectionColor={palette.text}
                style={styles.input}
                value={title}
              />
              <View style={styles.inputLine} />
              <ActionButton
                disabled={starting || title.trim().length === 0}
                label={starting ? '正在开启…' : '开启沉浸'}
                onPress={() => void start()}
              />
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>最近 7 天</Text>
          <View style={styles.metrics}>
            <Metric label="次沉浸" value={String(summary?.count ?? 0)} />
            <Metric label="总分钟" value={String(totalMinutes)} />
            <Metric label="平均时长" value={String(averageMinutes)} />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        <BottomLink label="查看历史" onPress={() => router.push('/history')} />
        <BottomLink label="数据迁移" onPress={() => router.push('/backup')} />
      </View>
    </KeyboardAvoidingView>
  );
}

function ActionButton({
  disabled = false,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
    >
      <Text style={[styles.actionLabel, disabled && styles.actionDisabled]}>{label}</Text>
    </Pressable>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function BottomLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Text style={styles.bottomLink}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { flexGrow: 1, paddingHorizontal: 32 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background },
  loadingText: { marginTop: 12, color: palette.secondary, fontSize: 15 },
  header: { alignItems: 'center' },
  title: { color: palette.text, fontSize: 42, fontWeight: '400', letterSpacing: -1.1, lineHeight: 50 },
  subtitle: { marginTop: 4, color: palette.text, fontSize: 17, fontWeight: '400', lineHeight: 26 },
  goalSection: { marginTop: 48 },
  sectionTitle: { color: palette.text, fontSize: 23, fontWeight: '700', lineHeight: 32 },
  input: { height: 49, marginTop: 13, paddingHorizontal: 0, paddingVertical: 8, color: palette.text, fontSize: 18, fontWeight: '400', lineHeight: 26 },
  inputLine: { height: StyleSheet.hairlineWidth, backgroundColor: palette.line },
  actionButton: { alignSelf: 'center', minHeight: 48, justifyContent: 'center', marginTop: 22, paddingHorizontal: 18 },
  actionLabel: { color: palette.text, fontSize: 20, fontWeight: '400', lineHeight: 28 },
  actionDisabled: { color: palette.text },
  activeRow: { minHeight: 50, marginTop: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line, justifyContent: 'center' },
  activeCopy: { paddingBottom: 8 },
  activeTitle: { color: palette.text, fontSize: 18, lineHeight: 25 },
  activeDuration: { marginTop: 2, color: palette.secondary, fontSize: 14, lineHeight: 20 },
  error: { marginTop: 12, color: palette.error, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  summarySection: { marginTop: 74 },
  summaryTitle: { color: palette.text, fontSize: 18, fontWeight: '500', lineHeight: 26 },
  metrics: { flexDirection: 'row', marginTop: 18 },
  metric: { flex: 1 },
  metricValue: { color: palette.text, fontSize: 28, fontWeight: '500', lineHeight: 34 },
  metricLabel: { marginTop: 2, color: palette.text, fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bottomBar: { position: 'absolute', right: 0, bottom: 0, left: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 18, paddingHorizontal: 24, backgroundColor: palette.background },
  bottomLink: { color: palette.text, fontSize: 17, fontWeight: '400', lineHeight: 26 },
  pressed: { opacity: 0.45 },
});
