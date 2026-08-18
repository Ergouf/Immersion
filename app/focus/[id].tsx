import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, AppState, KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';

import { SQLiteDistractionRepository, ActiveSessionRequiredError } from '../../src/data/repositories/distraction-repository';
import { SQLiteSessionRepository } from '../../src/data/repositories/session-repository';
import { calculateDurationMs, formatDuration, type Session } from '../../src/domain/session';
import { normalizeDistractionText } from '../../src/domain/distraction';
import { createId } from '../../src/shared/id';
import { SessionService } from '../../src/services/session-service';
import { AppInput, AppText, InlineError, LoadingState, PrimaryButton, QuietLink, Screen, SecondaryButton, SectionTitle } from '../../src/ui/primitives';
import { spacing, typography, useAppColors } from '../../src/theme/tokens';

export default function FocusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Array.isArray(id) ? id[0] : id;
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = useAppColors();
  const [session, setSession] = useState<Session | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [ending, setEnding] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const sessionService = useMemo(() => new SessionService(new SQLiteSessionRepository(db)), [db]);

  const refresh = async () => {
    if (!sessionId) {
      setError('找不到这次沉浸。');
      setLoading(false);
      return;
    }
    try {
      const next = await sessionService.getById(sessionId);
      if (!next) setError('找不到这次沉浸。');
      else if (next.endedAt !== null) router.replace({ pathname: '/review/[id]', params: { id: next.id } });
      else {
        setSession(next);
        setElapsed(calculateDurationMs(next) ?? 0);
        setError(null);
      }
    } catch {
      setError('这次沉浸暂时无法读取。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => setElapsed(calculateDurationMs(session) ?? 0), 1000);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [session]);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => { if (mounted) setReduceMotion(enabled); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  const end = async () => {
    if (!session || ending) return;
    setEnding(true);
    try {
      const ended = await sessionService.end(session.id);
      if (ended) router.replace({ pathname: '/review/[id]', params: { id: ended.id } });
    } catch {
      setError('结束失败，本次沉浸仍然保持安全状态。');
    } finally { setEnding(false); }
  };

  const saveDistraction = async () => {
    if (saving) return;
    const text = normalizeDistractionText(draft);
    if (!text) { setCaptureError('请先写下一句话。'); return; }
    if (!session) { setCaptureError('当前沉浸已经结束。'); return; }
    setSaving(true);
    setCaptureError(null);
    try {
      await new SQLiteDistractionRepository(db).addForActiveSession({ id: createId('thought'), sessionId: session.id, text, createdAt: Date.now() });
      setDraft('');
      setCaptureOpen(false);
    } catch (cause) {
      setCaptureError(cause instanceof ActiveSessionRequiredError ? '本次沉浸已结束，文字仍保留在这里。' : '暂存失败，文字仍保留在这里。');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingState label="正在恢复沉浸…" />;
  if (!session) return <Screen><SectionTitle>无法恢复</SectionTitle>{error ? <InlineError>{error}</InlineError> : null}<SecondaryButton onPress={() => router.replace('/')}>回到首页</SecondaryButton></Screen>;

  return (
    <Screen>
      <View style={styles.content}>
        <AppText muted>当前这一件事</AppText>
        <AppText accessibilityLabel={`当前活动：${session.title}`} style={styles.title}>{session.title}</AppText>
        <AppText accessibilityLabel={`已沉浸 ${formatDuration(elapsed)}`} style={styles.timer}>{formatDuration(elapsed)}</AppText>
        <AppText muted style={styles.helper}>时间会根据真实经过的时间计算。</AppText>
      </View>
      {error ? <InlineError>{error}</InlineError> : null}
      <View style={styles.actions}>
        <PrimaryButton onPress={() => void end()} disabled={ending} accessibilityLabel="结束沉浸">结束沉浸</PrimaryButton>
        <QuietLink onPress={() => { setCaptureError(null); setCaptureOpen(true); }}>记录一个念头</QuietLink>
      </View>

      <Modal visible={captureOpen} animationType={reduceMotion ? 'none' : 'fade'} transparent onRequestClose={() => setCaptureOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <SectionTitle>记录一个念头</SectionTitle>
            <AppText muted style={{ marginTop: spacing.xs }}>写下它，然后回到眼前的事。</AppText>
            <AppInput autoFocus multiline value={draft} onChangeText={setDraft} placeholder="我突然想起……" accessibilityLabel="念头内容" style={styles.multiline} />
            {captureError ? <InlineError>{captureError}</InlineError> : null}
            <View style={styles.modalActions}><SecondaryButton onPress={() => setCaptureOpen(false)}>取消</SecondaryButton><PrimaryButton onPress={() => void saveDistraction()} disabled={saving}>暂存</PrimaryButton></View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...typography.heading, marginTop: spacing.sm, textAlign: 'center' },
  timer: { fontSize: 58, lineHeight: 70, fontWeight: '400', letterSpacing: -1.2, marginTop: spacing.xl },
  helper: { marginTop: spacing.sm },
  actions: { gap: spacing.xs, alignItems: 'center', paddingBottom: spacing.lg },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { borderTopWidth: StyleSheet.hairlineWidth, padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  multiline: { minHeight: 112, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, alignItems: 'stretch' },
});
