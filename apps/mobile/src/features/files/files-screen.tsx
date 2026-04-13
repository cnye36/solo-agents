import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { KnowledgeFile } from "@solo-agents/types";
import { colors, radii, spacing } from "@/constants/theme";

function fileIcon(name: string): React.ComponentProps<typeof Ionicons>["name"] {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "document-text-outline";
  if (lower.endsWith(".md") || lower.endsWith(".txt")) return "document-outline";
  if (lower.endsWith(".csv") || lower.endsWith(".xls") || lower.endsWith(".xlsx"))
    return "grid-outline";
  if (lower.endsWith(".json") || lower.endsWith(".yaml") || lower.endsWith(".yml"))
    return "code-slash-outline";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
    return "image-outline";
  return "document-outline";
}

function statusColor(status: string): string {
  switch (status) {
    case "ready":
    case "indexed":
      return colors.success;
    case "processing":
      return colors.warning;
    case "error":
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

export function FilesScreen({ files }: { files: KnowledgeFile[] }) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Knowledge</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {files.length} file{files.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {files.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="library-outline" size={40} color={colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>No knowledge files</Text>
          <Text style={styles.emptySubtitle}>
            Files attached to your assistant will appear here. Add them from the web app or API.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Files</Text>
          {files.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function FileRow({ file }: { file: KnowledgeFile }) {
  const dotColor = statusColor(file.status);
  return (
    <View style={styles.fileRow}>
      <View style={styles.fileIcon}>
        <Ionicons name={fileIcon(file.name)} size={22} color={colors.accent} />
      </View>
      <View style={styles.fileMeta}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name}
        </Text>
        <View style={styles.fileMetaRow}>
          <Text style={styles.fileSize}>{file.sizeLabel}</Text>
          <View style={styles.statusDot}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <Text style={[styles.fileStatus, { color: dotColor }]}>{file.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerBadge: {
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  headerBadgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },

  // File row
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileMeta: { flex: 1, gap: 4 },
  fileName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  fileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  fileSize: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fileStatus: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
