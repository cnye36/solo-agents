import { Redirect } from "expo-router";
import type { Href } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "@/providers/session-provider";
import { colors } from "@/constants/theme";

export default function IndexScreen() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return session ? (
    <Redirect href={"/(tabs)/chat" as Href} />
  ) : (
    <Redirect href={"/(auth)/sign-in" as Href} />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
