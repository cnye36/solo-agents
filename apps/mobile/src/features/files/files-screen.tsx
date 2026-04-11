import { StyleSheet, Text, View } from "react-native";
import type { KnowledgeFile } from "@solo-agents/types";
import { colors, radii, spacing } from "@/constants/theme";
import { EmptyState, SectionCard } from "@/components/ui";

export function FilesScreen({ files }: { files: KnowledgeFile[] }) {
  return (
    <>
      <SectionCard
        title="Knowledge files"
        subtitle="This mirrors the existing backend file list. Upload support is still a placeholder in the current BFF."
      >
        {files.length ? (
          <View style={styles.list}>
            {files.map((file) => (
              <View key={file.id} style={styles.item}>
                <View style={styles.copy}>
                  <Text style={styles.name}>{file.name}</Text>
                  <Text style={styles.meta}>
                    {file.sizeLabel} · {file.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="No files yet"
            description="Once the assistant has attached knowledge files, they will show up here."
          />
        )}
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  item: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  copy: {
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
