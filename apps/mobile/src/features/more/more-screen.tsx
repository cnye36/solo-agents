import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { PreferenceGroup } from "@solo-agents/types";
import { APP_NAME } from "@solo-agents/config";
import { colors, radii, spacing } from "@/constants/theme";

type MoreScreenProps = {
  email: string;
  planName: string;
  renewalLabel: string;
  preferences: PreferenceGroup[];
  onSignOut: () => void;
};

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export function MoreScreen({
  email,
  planName,
  renewalLabel,
  preferences,
  onSignOut,
}: MoreScreenProps) {
  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {email || "Signed in"}
            </Text>
            <View style={styles.planBadge}>
              <Ionicons name="sparkles" size={11} color={colors.accent} />
              <Text style={styles.planBadgeText}>{planName || "Free"}</Text>
            </View>
          </View>
          <View style={styles.renewalChip}>
            <Text style={styles.renewalLabel}>Renews</Text>
            <Text style={styles.renewalValue}>{renewalLabel || "—"}</Text>
          </View>
        </View>

        {/* Assistant section */}
        <SettingsGroup title="Assistant">
          <SettingsRow
            icon="sparkles-outline"
            label="Memory"
            description="What your assistant remembers"
            onPress={() => {}}
          />
          <SettingsRow
            icon="flash-outline"
            label="Skills"
            description="Capabilities and custom instructions"
            onPress={() => {}}
            isLast
          />
        </SettingsGroup>

        {/* Integrations shortcut */}
        <SettingsGroup title="Workspace">
          <SettingsRow
            icon="apps-outline"
            label="Tools & Integrations"
            description="Manage connected services"
            onPress={() => {}}
          />
          <SettingsRow
            icon="library-outline"
            label="Knowledge Base"
            description="Files attached to your assistant"
            onPress={() => {}}
            isLast
          />
        </SettingsGroup>

        {/* Preferences from API */}
        {preferences.map((group) => (
          <SettingsGroup key={group.title} title={group.title}>
            {group.items.map((item, idx) => (
              <View
                key={`${group.title}-${item.label}`}
                style={[styles.prefRow, idx === group.items.length - 1 && styles.rowLast]}
              >
                <Text style={styles.prefLabel}>{item.label}</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {item.value}
                </Text>
              </View>
            ))}
          </SettingsGroup>
        ))}

        {/* App info */}
        <SettingsGroup title="App">
          <SettingsRow
            icon="information-circle-outline"
            label={APP_NAME}
            description="Version 0.1.0"
            onPress={() => {}}
            isLast
          />
        </SettingsGroup>

        {/* Sign out */}
        <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  onPress,
  isLast = false,
}: {
  icon: IoniconName;
  label: string;
  description?: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.settingsRow, isLast && styles.rowLast]}
      activeOpacity={0.7}
    >
      <View style={styles.settingsRowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.settingsRowCopy}>
        <Text style={styles.settingsRowLabel}>{label}</Text>
        {description ? (
          <Text style={styles.settingsRowDescription}>{description}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Profile
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentMuted,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
    gap: 5,
  },
  profileEmail: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  planBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  renewalChip: {
    alignItems: "flex-end",
    gap: 2,
  },
  renewalLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  renewalValue: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
  },

  // Settings group
  group: { gap: spacing.xs },
  groupTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: spacing.xs,
    marginBottom: 4,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  // Settings row
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  settingsRowIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  settingsRowCopy: { flex: 1, gap: 2 },
  settingsRowLabel: { color: colors.text, fontSize: 15, fontWeight: "600" },
  settingsRowDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 16 },

  // Preference row
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  prefLabel: { color: colors.textSoft, fontSize: 14, fontWeight: "500" },
  prefValue: { color: colors.textMuted, fontSize: 13, maxWidth: "55%" },

  // Sign out
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 52,
    borderRadius: radii.lg,
    backgroundColor: "rgba(251, 113, 133, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(251, 113, 133, 0.25)",
  },
  signOutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "700",
  },
});
