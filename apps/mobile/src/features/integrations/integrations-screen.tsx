import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type {
  IntegrationAuthType,
  IntegrationCatalogItem,
} from "@solo-agents/types";
import { colors, radii, spacing } from "@/constants/theme";
import {
  disconnectIntegration,
  listIntegrationCatalog,
  saveIntegrationConnection,
} from "@/lib/api/services";
import { useSession } from "@/providers/session-provider";
import {
  EmptyState,
  ErrorBanner,
  InputField,
  PrimaryButton,
  SectionCard,
  SecondaryButton,
} from "@/components/ui";

type IntegrationsScreenProps = {
  initialApps: IntegrationCatalogItem[];
};

type CredentialFormState = {
  apiKey: string;
  accessToken: string;
  basicAuthUsername: string;
  basicAuthPassword: string;
};

const initialCredentialState: CredentialFormState = {
  apiKey: "",
  accessToken: "",
  basicAuthUsername: "",
  basicAuthPassword: "",
};

function authTypeLabel(authType: IntegrationAuthType) {
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

export function IntegrationsScreen({
  initialApps,
}: IntegrationsScreenProps) {
  const { session } = useSession();
  const [apps, setApps] = useState(initialApps);
  const [selectedApp, setSelectedApp] = useState<IntegrationCatalogItem | null>(null);
  const [formState, setFormState] = useState(initialCredentialState);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const connectedCount = useMemo(
    () => apps.filter((app) => app.connection?.status === "connected").length,
    [apps],
  );

  useEffect(() => {
    if (apps.length) {
      return;
    }

    void refreshCatalog().catch(() => {
      // Surface the next actionable error through the existing UI state.
      setError("Unable to load integration catalog.");
    });
  }, [apps.length]);

  async function refreshCatalog() {
    const response = await listIntegrationCatalog(session);
    setApps(response.apps ?? []);
  }

  async function handleSave() {
    if (!selectedApp) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setInfo(null);

    try {
      await saveIntegrationConnection(session, {
        integrationId: selectedApp.id,
        apiKey: formState.apiKey,
        accessToken: formState.accessToken,
        basicAuthUsername: formState.basicAuthUsername,
        basicAuthPassword: formState.basicAuthPassword,
      });

      await refreshCatalog();
      setInfo(`Saved credentials for ${selectedApp.name}.`);
      setSelectedApp(null);
      setFormState(initialCredentialState);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save credentials.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisconnect(app: IntegrationCatalogItem) {
    setError(null);
    setInfo(null);

    try {
      await disconnectIntegration(session, app.id);
      await refreshCatalog();
      setInfo(`Disconnected ${app.name}.`);
    } catch (disconnectError) {
      setError(
        disconnectError instanceof Error
          ? disconnectError.message
          : "Unable to disconnect integration.",
      );
    }
  }

  return (
    <>
      {error ? <ErrorBanner message={error} /> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      <SectionCard
        title="Connected apps"
        subtitle={`${connectedCount} integration${connectedCount === 1 ? "" : "s"} connected across API and MCP sources.`}
      >
        {apps.length ? (
          <View style={styles.catalog}>
            {apps.map((app) => {
              const isConnected = app.connection?.status === "connected";

              return (
                <Pressable
                  key={app.id}
                  onPress={() => {
                    setSelectedApp(app);
                    setFormState(initialCredentialState);
                    setInfo(null);
                    setError(null);
                  }}
                  style={styles.catalogItem}
                >
                  <View style={styles.catalogHeader}>
                    <Text style={styles.catalogName}>{app.name}</Text>
                    <Text style={styles.catalogBadge}>
                      {isConnected ? "Connected" : authTypeLabel(app.authType)}
                    </Text>
                  </View>
                  <Text style={styles.catalogDescription}>{app.description}</Text>
                  <Text style={styles.catalogMeta}>
                    {app.source.toUpperCase()} source · {app.actionCount} actions
                  </Text>
                  {isConnected ? (
                    <SecondaryButton label="Disconnect" onPress={() => void handleDisconnect(app)} />
                  ) : (
                    <SecondaryButton label="Configure" onPress={() => setSelectedApp(app)} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title="No integrations available"
            description="The backend did not return any integration catalog entries for this account."
          />
        )}
      </SectionCard>

      {selectedApp ? (
        <SectionCard
          title={selectedApp.name}
          subtitle={`Configure ${authTypeLabel(selectedApp.authType)} credentials for this integration.`}
          action={<SecondaryButton label="Close" onPress={() => setSelectedApp(null)} />}
        >
          {selectedApp.authType === "api_key" ? (
            <InputField
              label="API key"
              value={formState.apiKey}
              onChangeText={(value) => setFormState((current) => ({ ...current, apiKey: value }))}
              placeholder="Paste the API key"
            />
          ) : null}
          {selectedApp.authType === "bearer" ? (
            <InputField
              label="Access token"
              value={formState.accessToken}
              onChangeText={(value) => setFormState((current) => ({ ...current, accessToken: value }))}
              placeholder="Paste the bearer token"
            />
          ) : null}
          {selectedApp.authType === "basic" ? (
            <>
              <InputField
                label="Username"
                value={formState.basicAuthUsername}
                onChangeText={(value) =>
                  setFormState((current) => ({ ...current, basicAuthUsername: value }))
                }
                placeholder="Username"
              />
              <InputField
                label="Password"
                value={formState.basicAuthPassword}
                onChangeText={(value) =>
                  setFormState((current) => ({ ...current, basicAuthPassword: value }))
                }
                placeholder="Password"
                secureTextEntry
              />
            </>
          ) : null}
          {selectedApp.authType === "none" ? (
            <Text style={styles.helpText}>
              This integration does not require credentials. Save to enable it for your workspace.
            </Text>
          ) : null}
          {selectedApp.authType === "oauth2" ? (
            <Text style={styles.helpText}>
              OAuth redirect flows are not implemented in this mobile build yet. The catalog is ready,
              but provider handshakes still need a callback screen and deep-link wiring.
            </Text>
          ) : null}
          {selectedApp.authType !== "oauth2" ? (
            <PrimaryButton label="Save connection" onPress={() => void handleSave()} loading={isSaving} />
          ) : null}
        </SectionCard>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  info: {
    color: "#d8b4fe",
    fontSize: 14,
    lineHeight: 20,
  },
  catalog: {
    gap: spacing.md,
  },
  catalogItem: {
    gap: spacing.sm,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  catalogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  catalogName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  catalogBadge: {
    color: "#c4b5fd",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  catalogDescription: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  catalogMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  helpText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
