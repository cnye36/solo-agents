import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { IntegrationCatalogItem } from "@solo-agents/types";
import { APP_NAME, NAV_ITEMS } from "@solo-agents/config";
import { colors, radii, spacing } from "@/constants/theme";
import { useAppData } from "@/hooks/use-app-data";
import { AccountScreen } from "@/features/account/account-screen";
import { ChatScreen } from "@/features/chat/chat-screen";
import { FilesScreen } from "@/features/files/files-screen";
import { IntegrationsScreen } from "@/features/integrations/integrations-screen";
import { listIntegrationCatalog } from "@/lib/api/services";
import { useSession } from "@/providers/session-provider";
import { EmptyState, ErrorBanner, Screen, SecondaryButton, SectionCard } from "@/components/ui";

const supportedRoutes = new Set(["/chat", "/integrations", "/files", "/account"]);

export function AppShell() {
  const { data, error, isLoading, refresh } = useAppData();
  const { signOut, session } = useSession();
  const [route, setRoute] = useState<string>("/chat");
  const [integrationApps, setIntegrationApps] = useState<IntegrationCatalogItem[]>([]);

  const navigation = useMemo(
    () => NAV_ITEMS.filter((item) => supportedRoutes.has(item.href)),
    [],
  );

  useEffect(() => {
    if (!session) {
      setIntegrationApps([]);
      return;
    }

    void listIntegrationCatalog(session)
      .then((response) => {
        setIntegrationApps(response.apps ?? []);
      })
      .catch(() => {
        // Keep the screen usable even if the richer catalog fetch fails.
      });
  }, [session]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Loading your assistant workspace...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen scroll>
        <ErrorBanner message={error} />
        <SectionCard title="Unable to load the workspace">
          <SecondaryButton label="Retry" onPress={() => void refresh()} />
        </SectionCard>
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen scroll>
        <EmptyState
          title="Assistant not ready"
          description="The backend did not return bootstrap data yet. Finish assistant provisioning in the API layer first."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Solo Agents mobile</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>
          Bearer-authenticated mobile client on top of the existing Supabase and Hono stack.
        </Text>
      </View>

      <View style={styles.navRow}>
        {navigation.map((item) => {
          const active = item.href === route;
          return (
            <Pressable
              key={item.href}
              onPress={() => setRoute(item.href)}
              style={[styles.navChip, active && styles.navChipActive]}
            >
              <Text style={[styles.navChipText, active && styles.navChipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {route === "/chat" ? (
        <ChatScreen assistantName={data.assistant.name} initialThreads={data.recentThreads} />
      ) : null}

      {route === "/integrations" ? (
        <IntegrationsScreen initialApps={integrationApps} />
      ) : null}

      {route === "/files" ? <FilesScreen files={data.files} /> : null}

      {route === "/account" ? (
        <AccountScreen
          email={data.user.email}
          planName={data.billing.planName}
          renewalLabel={data.billing.renewalLabel}
          preferences={data.preferences}
          onSignOut={() => void signOut()}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  navChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navChipActive: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.accentMuted,
  },
  navChipText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  navChipTextActive: {
    color: colors.text,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
