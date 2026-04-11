import { StyleSheet, Text, View } from "react-native";
import type { PreferenceGroup } from "@solo-agents/types";
import { colors, radii, spacing } from "@/constants/theme";
import { PrimaryButton, SectionCard } from "@/components/ui";

type AccountScreenProps = {
  email: string;
  planName: string;
  renewalLabel: string;
  preferences: PreferenceGroup[];
  onSignOut: () => void;
};

export function AccountScreen({
  email,
  planName,
  renewalLabel,
  preferences,
  onSignOut,
}: AccountScreenProps) {
  return (
    <>
      <SectionCard title="Account" subtitle={email || "Signed in"}>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Plan</Text>
            <Text style={styles.metricValue}>{planName}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Renewal</Text>
            <Text style={styles.metricValue}>{renewalLabel}</Text>
          </View>
        </View>
        <PrimaryButton label="Sign out" onPress={onSignOut} />
      </SectionCard>

      {preferences.map((group) => (
        <SectionCard key={group.title} title={group.title} subtitle={group.description}>
          <View style={styles.preferenceList}>
            {group.items.map((item) => (
              <View key={`${group.title}-${item.label}`} style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>{item.label}</Text>
                <Text style={styles.preferenceValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  preferenceList: {
    gap: spacing.sm,
  },
  preferenceRow: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs,
  },
  preferenceLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  preferenceValue: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 20,
  },
});
