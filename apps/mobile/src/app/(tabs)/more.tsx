import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MoreScreen } from "@/features/more/more-screen";
import { useAppDataContext } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { colors, radii, spacing } from "@/constants/theme";

export default function MoreTab() {
  const { data, isLoading } = useAppDataContext();
  const { signOut } = useSession();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <TouchableOpacity
          onPress={() => void signOut()}
          style={styles.signOutButton}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <MoreScreen
      email={data?.user.email ?? ""}
      planName={data?.billing.planName ?? ""}
      renewalLabel={data?.billing.renewalLabel ?? ""}
      preferences={data?.preferences ?? []}
      onSignOut={() => void signOut()}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    padding: spacing.lg,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
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
