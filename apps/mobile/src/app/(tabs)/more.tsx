import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MoreScreen } from "@/features/more/more-screen";
import { useAppDataContext } from "@/providers/app-data-provider";
import { useSession } from "@/providers/session-provider";
import { colors } from "@/constants/theme";

export default function MoreTab() {
  const { data, isLoading } = useAppDataContext();
  const { signOut } = useSession();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
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
  },
});
