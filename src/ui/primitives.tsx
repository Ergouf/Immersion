import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { radii, spacing, typography, useAppColors } from '../theme/tokens';

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
  return <TextInput {...props} placeholderTextColor={colors.secondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }, props.style]} />;
}

export function PrimaryButton({ children, onPress, disabled = false, accessibilityLabel }: PropsWithChildren<{ onPress: () => void; disabled?: boolean; accessibilityLabel?: string }>) {
  const colors = useAppColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent, opacity: disabled ? 0.48 : pressed ? 0.78 : 1 }]}><Text style={[typography.body, styles.primaryText, { color: colors.accentText }]}>{children}</Text></Pressable>;
}

export function SecondaryButton({ children, onPress, disabled = false, accessibilityLabel }: PropsWithChildren<{ onPress: () => void; disabled?: boolean; accessibilityLabel?: string }>) {
  const colors = useAppColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface, opacity: disabled ? 0.48 : pressed ? 0.75 : 1 }]}><Text style={[typography.body, { color: colors.text }]}>{children}</Text></Pressable>;
}

export function QuietLink({ children, onPress, accessibilityLabel }: PropsWithChildren<{ onPress: () => void; accessibilityLabel?: string }>) {
  const colors = useAppColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1, paddingVertical: spacing.sm })}><Text style={[typography.body, { color: colors.accent, textDecorationLine: 'underline' }]}>{children}</Text></Pressable>;
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
  input: { minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16 },
  primaryButton: { minHeight: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  primaryText: { fontWeight: '700' },
  secondaryButton: { minHeight: 50, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  card: { borderRadius: radii.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
