import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { spacing, typography, useAppColors } from '../theme/tokens';

export function Screen({ children, scroll = false }: PropsWithChildren<{ scroll?: boolean }>) {
  const colors = useAppColors();
  const content = <View style={[styles.screen, { backgroundColor: colors.background }]}>{children}</View>;
  if (scroll) {
    return <ScrollView contentContainerStyle={styles.scrollContent} style={{ backgroundColor: colors.background }}>{children}</ScrollView>;
  }
  return content;
}

export function AppText({ children, muted = false, style, accessibilityLabel }: { children: ReactNode; muted?: boolean; style?: object; accessibilityLabel?: string }) {
  const colors = useAppColors();
  return <Text accessibilityLabel={accessibilityLabel} style={[typography.body, { color: muted ? colors.secondary : colors.text }, style]}>{children}</Text>;
}

export function Title({ children }: PropsWithChildren) {
  const colors = useAppColors();
  return <Text style={[typography.title, { color: colors.text }]}>{children}</Text>;
}

export function SectionTitle({ children }: PropsWithChildren) {
  const colors = useAppColors();
  return <Text style={[typography.heading, { color: colors.text }]}>{children}</Text>;
}

export function AppInput(props: React.ComponentProps<typeof TextInput>) {
  const colors = useAppColors();
  return <TextInput {...props} placeholderTextColor={colors.secondary} selectionColor={colors.text} style={[styles.input, { color: colors.text, borderColor: colors.border }, props.style]} />;
}

export function PrimaryButton({ children, onPress, disabled = false, accessibilityLabel }: PropsWithChildren<{ onPress: () => void; disabled?: boolean; accessibilityLabel?: string }>) {
  const colors = useAppColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { opacity: disabled ? 0.34 : pressed ? 0.45 : 1 }]}><Text style={[typography.body, styles.primaryText, { color: colors.text }]}>{children}</Text></Pressable>;
}

export function SecondaryButton({ children, onPress, disabled = false, accessibilityLabel }: PropsWithChildren<{ onPress: () => void; disabled?: boolean; accessibilityLabel?: string }>) {
  const colors = useAppColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border, opacity: disabled ? 0.34 : pressed ? 0.45 : 1 }]}><Text style={[typography.body, { color: colors.text }]}>{children}</Text></Pressable>;
}

export function QuietLink({ children, onPress, accessibilityLabel }: PropsWithChildren<{ onPress: () => void; accessibilityLabel?: string }>) {
  const colors = useAppColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.45 : 1, paddingVertical: spacing.sm })}><Text style={[typography.body, { color: colors.text }]}>{children}</Text></Pressable>;
}

export function Card({ children }: PropsWithChildren) {
  const colors = useAppColors();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>;
}

export function InlineError({ children }: PropsWithChildren) {
  const colors = useAppColors();
  return <AppText style={{ color: colors.danger, marginTop: spacing.sm }}>{children}</AppText>;
}

export function LoadingState({ label = '正在准备…' }: { label?: string }) {
  const colors = useAppColors();
  return <View style={styles.loading}><ActivityIndicator color={colors.accent} /><AppText muted style={{ marginTop: spacing.sm }}>{label}</AppText></View>;
}

export function Divider() {
  const colors = useAppColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.md }} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  title: { marginBottom: spacing.sm },
  input: { minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 0, paddingVertical: spacing.sm, fontSize: 17 },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  primaryText: { fontSize: 18, fontWeight: '400' },
  secondaryButton: { minHeight: 50, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  card: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.lg, marginTop: spacing.md },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
