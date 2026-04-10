import type {
  AppBootstrapData,
  ConnectedApp,
  KnowledgeFile,
  PreferenceGroup,
  ThreadSummary,
} from "@solo-agents/types";
import { supabaseAdmin } from "@/clients/supabase-admin";

type AssistantRow = {
  assistant_id: string;
  metadata: {
    description?: string;
    workspace_id?: string;
    team_id?: string;
    [key: string]: unknown;
  } | null;
};

export async function getActiveWorkspaceId(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("preferences")
    .eq("id", userId)
    .maybeSingle();

  const preferences = (profile?.preferences ?? {}) as {
    activeWorkspaceId?: string;
  };

  if (preferences.activeWorkspaceId) {
    return preferences.activeWorkspaceId;
  }

  const { data: membership } = await supabaseAdmin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  return membership?.workspace_id ?? null;
}

export async function getPrimaryAssistant(userId: string) {
  const { data: mapping } = await supabaseAdmin
    .from("user_assistants")
    .select("assistant_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (!mapping?.assistant_id) {
    return null;
  }

  const { data: assistant } = await supabaseAdmin
    .from("assistant")
    .select("assistant_id, metadata")
    .eq("assistant_id", mapping.assistant_id)
    .maybeSingle<AssistantRow>();

  if (!assistant) {
    return null;
  }

  return {
    id: assistant.assistant_id,
    workspaceId: assistant.metadata?.workspace_id ?? null,
    teamId: assistant.metadata?.team_id ?? null,
    name: "Northstar Assistant",
    description:
      assistant.metadata?.description?.trim() ||
      "Your personal assistant backed by the existing AffinityBots runtime.",
  };
}

export async function getRecentThreads(
  userId: string,
  assistantId: string,
): Promise<ThreadSummary[]> {
  const query = supabaseAdmin
    .from("thread")
    .select("thread_id, metadata, updated_at")
    .eq("metadata->>assistant_id", assistantId)
    .eq("metadata->>user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(10);

  const { data } = await query;

  return (data ?? []).map((thread) => {
    const metadata = (thread.metadata ?? {}) as {
      title?: string;
      preview?: string;
    };

    return {
      id: thread.thread_id,
      title: metadata.title?.trim() || "Untitled conversation",
      preview:
        metadata.preview?.trim() ||
        "Open this conversation to continue where you left off.",
      updatedAt: new Date(thread.updated_at).toLocaleDateString(),
    };
  });
}

export async function getKnowledgeFiles(
  assistantId: string,
): Promise<KnowledgeFile[]> {
  const { data: assignments } = await supabaseAdmin
    .from("document_assignments")
    .select("document_id")
    .eq("assistant_id", assistantId);

  const documentIds = (assignments ?? []).map((item) => item.document_id);

  if (documentIds.length === 0) {
    return [];
  }

  const { data: documents } = await supabaseAdmin
    .from("documents")
    .select("id, filename, size, created_at")
    .in("id", documentIds)
    .order("created_at", { ascending: false });

  return (documents ?? []).map((document) => ({
    id: document.id,
    name: document.filename,
    status: "ready" as const,
    sizeLabel: document.size
      ? `${(document.size / 1024 / 1024).toFixed(1)} MB`
      : "Unknown size",
  }));
}

export async function getConnectedApps(
  userId: string,
  workspaceId: string | null,
): Promise<ConnectedApp[]> {
  const [{ data: integrations }, { data: connections }] = await Promise.all([
    supabaseAdmin
      .from("integrations")
      .select("id, name, description")
      .eq("is_active", true)
      .order("name"),
    workspaceId
      ? supabaseAdmin
          .from("user_integration_connections")
          .select("integration_id")
          .eq("user_id", userId)
          .eq("workspace_id", workspaceId)
      : Promise.resolve({ data: [] as Array<{ integration_id: string }> }),
  ]);

  const connected = new Set(
    (connections ?? []).map((connection) => connection.integration_id),
  );

  return (integrations ?? []).slice(0, 6).map((integration) => ({
    id: integration.id,
    name: integration.name,
    status: connected.has(integration.id) ? "connected" : "available",
    summary:
      integration.description?.trim() ||
      `Connect ${integration.name} so your assistant can use it when needed.`,
  }));
}

export async function getBillingSummary(userId: string) {
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_type, plan_override, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const planName =
    subscription?.plan_override ?? subscription?.plan_type ?? "free";

  return {
    planName: planName[0].toUpperCase() + planName.slice(1),
    renewalLabel: subscription?.current_period_end
      ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
      : "No renewal scheduled",
  };
}

export async function getPreferenceGroups(
  userId: string,
): Promise<PreferenceGroup[]> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  return [
    {
      title: "Response style",
      description: "How your assistant should sound and structure answers.",
      items: [
        { label: "Tone", value: "Clear and confident" },
        { label: "Default length", value: "Concise with optional detail" },
      ],
    },
    {
      title: "Profile",
      description: "Identity and memory-related defaults for the experience.",
      items: [
        { label: "Username", value: profile?.username?.trim() || "Not set" },
        { label: "Memory", value: "Enabled by platform" },
      ],
    },
  ];
}

export async function buildBootstrapData(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
): Promise<AppBootstrapData | null> {
  const assistant = await getPrimaryAssistant(user.id);

  if (!assistant) {
    return null;
  }

  const workspaceId = assistant.workspaceId ?? (await getActiveWorkspaceId(user.id));
  const [recentThreads, files, connectedApps, preferences, billing] =
    await Promise.all([
      getRecentThreads(user.id, assistant.id),
      getKnowledgeFiles(assistant.id),
      getConnectedApps(user.id, workspaceId),
      getPreferenceGroups(user.id),
      getBillingSummary(user.id),
    ]);

  return {
    user: {
      firstName:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name.split(" ")[0] ?? "there"
          : "there",
      email: user.email ?? "",
    },
    assistant: {
      id: assistant.id,
      name: assistant.name,
      status: "ready",
      description: assistant.description,
    },
    recentThreads,
    connectedApps,
    files,
    preferences,
    onboardingComplete: true,
    billing,
  };
}
