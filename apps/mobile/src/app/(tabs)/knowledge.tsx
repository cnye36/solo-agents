import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FilesScreen } from "@/features/files/files-screen";
import { useAppDataContext } from "@/providers/app-data-provider";
import { colors } from "@/constants/theme";

export default function KnowledgeTab() {
  const { data, isLoading } = useAppDataContext();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return <FilesScreen files={data?.files ?? []} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
