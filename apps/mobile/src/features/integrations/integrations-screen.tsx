import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { IntegrationAuthType, IntegrationCatalogItem } from "@solo-agents/types";
import { colors, radii, spacing } from "@/constants/theme";
import {
  disconnectIntegration,
  listIntegrationCatalog,
  saveIntegrationConnection,
} from "@/lib/api/services";
import { useSession } from "@/providers/session-provider";

type CredentialForm = {
  apiKey: string;
  accessToken: string;
  basicAuthUsername: string;
  basicAuthPassword: string;
};

const emptyForm: CredentialForm = {
  apiKey: "",
  accessToken: "",
  basicAuthUsername: "",
  basicAuthPassword: "",
};

function authLabel(authType: IntegrationAuthType) {
  switch (authType) {
    case "oauth2":
      return "OAuth";
    case "api_key":
      return "API Key";
    case "bearer":
      return "Bearer";
    case "basic":
      return "Basic";
    default:
      return "No Auth";
  }
}

function sourceIcon(source: string): React.ComponentProps<typeof Ionicons>["name"] {
  if (source === "mcp") return "git-network-outline";
  return "cloud-outline";
}

export function IntegrationsScreen() {
  const { session } = useSession();
  const [apps, setApps] = useState<IntegrationCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<IntegrationCatalogItem | null>(null);
  const [form, setForm] = useState<CredentialForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const connectedApps = useMemo(
    () => apps.filter((a) => a.connection?.status === "connected"),
    [apps],
  );
  const availableApps = useMemo(
    () => apps.filter((a) => a.connection?.status !== "connected"),
    [apps],
  );

  useEffect(() => {
    void loadCatalog();
  }, []);

  async function loadCatalog() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listIntegrationCatalog(session);
      setApps(res.apps ?? []);
    } catch {
      setError("Unable to load integrations.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedApp) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveIntegrationConnection(session, {
        integrationId: selectedApp.id,
        apiKey: form.apiKey,
        accessToken: form.accessToken,
        basicAuthUsername: form.basicAuthUsername,
        basicAuthPassword: form.basicAuthPassword,
      });
      await loadCatalog();
      setSelectedApp(null);
      setForm(emptyForm);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save credentials.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisconnect(app: IntegrationCatalogItem) {
    try {
      await disconnectIntegration(session, app.id);
      await loadCatalog();
    } catch {
      setError(`Unable to disconnect ${app.name}.`);
    }
  }

  function openApp(app: IntegrationCatalogItem) {
    setSelectedApp(app);
    setForm(emptyForm);
    setSaveError(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tools</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{connectedApps.length} connected</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadCatalog()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {connectedApps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Connected</Text>
              {connectedApps.map((app) => (
                <AppRow
                  key={app.id}
                  app={app}
                  onPress={() => openApp(app)}
                  onDisconnect={() => void handleDisconnect(app)}
                />
              ))}
            </View>
          )}

          {availableApps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Available</Text>
              {availableApps.map((app) => (
                <AppRow key={app.id} app={app} onPress={() => openApp(app)} />
              ))}
            </View>
          )}

          {apps.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="apps-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No integrations available</Text>
              <Text style={styles.emptySubtitle}>
                Your account does not have any integration catalog entries yet.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Configure Modal */}
      <Modal
        visible={selectedApp !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedApp(null)}
      >
        {selectedApp && (
          <ConfigureSheet
            app={selectedApp}
            form={form}
            setForm={setForm}
            onSave={() => void handleSave()}
            onClose={() => setSelectedApp(null)}
            isSaving={isSaving}
            error={saveError}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

function AppRow({
  app,
  onPress,
}: {
  app: IntegrationCatalogItem;
  onPress: () => void;
  onDisconnect?: () => void;
}) {
  const isConnected = app.connection?.status === "connected";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.appRow, pressed && styles.appRowPressed]}>
      <View style={styles.appIcon}>
        <Ionicons name={sourceIcon(app.source)} size={20} color={colors.accent} />
      </View>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{app.name}</Text>
        <Text style={styles.appMeta} numberOfLines={1}>
          {app.actionCount} action{app.actionCount !== 1 ? "s" : ""} · {app.source.toUpperCase()}
        </Text>
      </View>
      {isConnected ? (
        <View style={styles.connectedBadge}>
          <View style={styles.connectedDot} />
          <Text style={styles.connectedText}>On</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

function ConfigureSheet({
  app,
  form,
  setForm,
  onSave,
  onClose,
  isSaving,
  error,
}: {
  app: IntegrationCatalogItem;
  form: CredentialForm;
  setForm: React.Dispatch<React.SetStateAction<CredentialForm>>;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const isConnected = app.connection?.status === "connected";

  return (
    <SafeAreaView style={styles.sheetContainer}>
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>{app.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.sheetContent}>
        {/* App info card */}
        <View style={styles.sheetInfoCard}>
          <View style={styles.sheetAppIcon}>
            <Ionicons name={sourceIcon(app.source)} size={28} color={colors.accent} />
          </View>
          <Text style={styles.sheetDescription}>{app.description}</Text>
          <View style={styles.sheetMeta}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{authLabel(app.authType)}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{app.actionCount} actions</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{app.source.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {error && (
          <View style={styles.sheetError}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={styles.sheetErrorText}>{error}</Text>
          </View>
        )}

        {/* Credential form */}
        {app.authType === "api_key" && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>API Key</Text>
            <TextInput
              value={form.apiKey}
              onChangeText={(v) => setForm((f) => ({ ...f, apiKey: v }))}
              placeholder="Paste your API key"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.fieldInput}
            />
          </View>
        )}

        {app.authType === "bearer" && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Access Token</Text>
            <TextInput
              value={form.accessToken}
              onChangeText={(v) => setForm((f) => ({ ...f, accessToken: v }))}
              placeholder="Paste the bearer token"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.fieldInput}
            />
          </View>
        )}

        {app.authType === "basic" && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                value={form.basicAuthUsername}
                onChangeText={(v) => setForm((f) => ({ ...f, basicAuthUsername: v }))}
                placeholder="Username"
                placeholderTextColor={colors.textMuted}
                style={styles.fieldInput}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                value={form.basicAuthPassword}
                onChangeText={(v) => setForm((f) => ({ ...f, basicAuthPassword: v }))}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={styles.fieldInput}
              />
            </View>
          </>
        )}

        {app.authType === "none" && (
          <View style={styles.sheetNote}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
            <Text style={styles.sheetNoteText}>
              This integration does not require credentials. Save to enable it.
            </Text>
          </View>
        )}

        {app.authType === "oauth2" && (
          <View style={styles.sheetNote}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
            <Text style={styles.sheetNoteText}>
              OAuth flows are not yet implemented in this mobile build. You can connect this
              integration from the web app.
            </Text>
          </View>
        )}

        {app.authType !== "oauth2" && (
          <TouchableOpacity
            onPress={onSave}
            disabled={isSaving}
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isConnected ? "Update credentials" : "Connect"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },

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
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  headerBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  section: { gap: spacing.xs },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },

  // App row
  appRow: {
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
  appRowPressed: { opacity: 0.75 },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  appInfo: { flex: 1, gap: 2 },
  appName: { color: colors.text, fontSize: 15, fontWeight: "600" },
  appMeta: { color: colors.textMuted, fontSize: 12 },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  connectedText: { color: colors.success, fontSize: 12, fontWeight: "700" },

  // Empty & error
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingTop: spacing.xxl * 2,
  },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptySubtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" },
  errorText: { color: colors.textMuted, fontSize: 15, textAlign: "center" },
  retryButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: { color: colors.textSoft, fontSize: 14, fontWeight: "600" },

  // Sheet
  sheetContainer: { flex: 1, backgroundColor: colors.background },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  sheetInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "flex-start",
  },
  sheetAppIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetDescription: { color: colors.textSoft, fontSize: 14, lineHeight: 20 },
  sheetMeta: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  metaChip: {
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  metaChipText: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  sheetError: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "rgba(251,113,133,0.1)",
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.25)",
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: "flex-start",
  },
  sheetErrorText: { color: colors.danger, fontSize: 13, lineHeight: 18, flex: 1 },
  sheetNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: "flex-start",
  },
  sheetNoteText: { color: colors.textMuted, fontSize: 14, lineHeight: 20, flex: 1 },

  // Field
  fieldGroup: { gap: spacing.xs },
  fieldLabel: { color: colors.textSoft, fontSize: 13, fontWeight: "600" },
  fieldInput: {
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },

  // Save button
  saveButton: {
    minHeight: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: colors.onPrimary, fontSize: 16, fontWeight: "700" },
});
