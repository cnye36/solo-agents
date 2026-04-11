import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing } from "@/constants/theme";

export function Screen({
  children,
  scroll = false,
}: PropsWithChildren<{ scroll?: boolean }>) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  action,
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}>) {
  return (
    <View style={styles.card}>
      {(title || subtitle || action) && (
        <View style={styles.cardHeader}>
          <View style={styles.cardCopy}>
            {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
            {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !(disabled || loading) ? styles.buttonPressed : null,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  emptyState: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    padding: spacing.lg,
    gap: spacing.xs,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  errorBanner: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(251, 113, 133, 0.28)",
    backgroundColor: "rgba(251, 113, 133, 0.12)",
    padding: spacing.md,
  },
  errorText: {
    color: "#fecdd3",
    fontSize: 14,
    lineHeight: 20,
  },
});
