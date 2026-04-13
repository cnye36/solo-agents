import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ChatScreen } from "@/features/chat/chat-screen";
import { useAppDataContext } from "@/providers/app-data-provider";
import { colors, spacing } from "@/constants/theme";

export default function ChatTab() {
  const { data, isLoading, error } = useAppDataContext();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Unable to load assistant."}</Text>
      </View>
    );
  }

  return (
    <ChatScreen assistantName={data.assistant.name} initialThreads={data.recentThreads} />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
