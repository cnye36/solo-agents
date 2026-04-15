import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  AppBootstrapData,
  ConnectedApp,
  IntegrationAuthType,
  IntegrationCatalogItem,
  IntegrationDetail,
  KnowledgeFile,
  PreferenceGroup,
  ThreadSummary,
} from "@solo-agents/types";
import { Client } from "@langchain/langgraph-sdk";
import { supabaseAdmin } from "@/clients/supabase-admin";
import { apiEnv } from "@/lib/env";
import { ensureSoloWorkspaceId } from "@/services/solo-workspace";

type AssistantRow = {
  assistant_id: string;
  graph_id?: string | null;
  name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  config?: Record<string, unknown> | null;
  workspace_id?: string | null;
  team_id?: string | null;
  metadata: {
    description?: string;
    workspace_id?: string;
    team_id?: string;
    owner_id?: string;
    app_source?: string;
    [key: string]: unknown;
  } | null;
};

const SOLO_ASSISTANT_APP_SOURCE = "solo-agents";
const SOLO_ASSISTANT_NAME = "Northstar Assistant";
const SOLO_ASSISTANT_DESCRIPTION =
  "A focused personal work assistant for chat, summarization, planning, research, and execution support.";
const SOLO_ASSISTANT_PROMPT = [
  "You are Northstar Assistant, a focused personal AI work assistant.",
  "Your job is to help the user think clearly, move faster, and produce strong outputs across research, planning, writing, analysis, and execution.",
  "Prioritize clarity, accuracy, and direct usefulness over theatrics.",
  "Use a confident, concise style by default, but expand when the task benefits from more structure or explanation.",
  "When the user asks for recommendations, compare options and explain tradeoffs.",
  "When requirements are ambiguous, make the smallest reasonable assumption and state it clearly.",
  "When context from files, connected tools, or memory is available, use it to ground your response.",
  "Do not behave like a niche specialist persona unless the user explicitly asks for one.",
].join("\n");

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

async function syncSoloAssistantWorkspace(
  assistantId: string,
  workspaceId: string,
): Promise<void> {
  const { data: row } = await supabaseAdmin
    .from("assistant")
    .select("config, metadata")
    .eq("assistant_id", assistantId)
    .maybeSingle();

  if (!row) {
    return;
  }

  const prevMeta = (row.metadata ?? {}) as Record<string, unknown>;
  const metadata = { ...prevMeta, workspace_id: workspaceId };

  const prevConfig = (row.config ?? {}) as {
    configurable?: Record<string, unknown>;
  };
  const configurable = {
    ...(prevConfig.configurable ?? {}),
    workspace_id: workspaceId,
  };
  const config = { ...prevConfig, configurable };

  const { error: dbError } = await supabaseAdmin
    .from("assistant")
    .update({
      workspace_id: workspaceId,
      metadata,
      config,
    })
    .eq("assistant_id", assistantId);

  if (dbError) {
    console.error("[assistant] failed to sync workspace in Supabase", dbError);
    return;
  }

  if (!apiEnv.langGraphApiUrl || !apiEnv.langSmithApiKey) {
    return;
  }

  try {
    const langgraphClient = new Client({
      apiUrl: apiEnv.langGraphApiUrl,
      apiKey: apiEnv.langSmithApiKey,
    });
    await langgraphClient.assistants.update(assistantId, {
      metadata,
      config,
    });
  } catch (error) {
    console.error("[assistant] LangGraph workspace sync failed", error);
  }
}

async function findSoloAssistant(userId: string) {
  const { data: assistants } = await supabaseAdmin
    .from("assistant")
    .select(
      "assistant_id, graph_id, name, created_at, updated_at, config, workspace_id, team_id, metadata",
    )
    .eq("metadata->>owner_id", userId)
    .eq("metadata->>app_source", SOLO_ASSISTANT_APP_SOURCE)
    .order("created_at", { ascending: false })
    .limit(1);

  const assistant = assistants?.[0] as AssistantRow | undefined;

  if (!assistant) {
    return null;
  }

  const metaWs = assistant.metadata?.workspace_id;
  const workspaceFromMeta =
    typeof metaWs === "string" ? metaWs : null;

  return {
    id: assistant.assistant_id,
    workspaceId: workspaceFromMeta ?? assistant.workspace_id ?? null,
    teamId: assistant.metadata?.team_id ?? null,
    name: assistant.name?.trim() || SOLO_ASSISTANT_NAME,
    description:
      assistant.metadata?.description?.trim() ||
      SOLO_ASSISTANT_DESCRIPTION,
  };
}

export async function getPrimaryAssistant(userId: string) {
  return findSoloAssistant(userId);
}

export async function ensurePrimaryAssistant(user: AuthUser) {
  const soloWorkspaceId = await ensureSoloWorkspaceId(user.id);
  const existingAssistant = await findSoloAssistant(user.id);

  if (existingAssistant) {
    const currentWs = existingAssistant.workspaceId ?? null;
    if (currentWs !== soloWorkspaceId) {
      await syncSoloAssistantWorkspace(existingAssistant.id, soloWorkspaceId);
      return {
        ...existingAssistant,
        workspaceId: soloWorkspaceId,
      };
    }
    return existingAssistant;
  }

  if (!apiEnv.langGraphApiUrl || !apiEnv.langSmithApiKey) {
    return null;
  }

  const workspaceId = soloWorkspaceId;
  const langgraphClient = new Client({
    apiUrl: apiEnv.langGraphApiUrl,
    apiKey: apiEnv.langSmithApiKey,
  });

  const assistant = await langgraphClient.assistants.create({
    graphId: "reactAgent",
    name: SOLO_ASSISTANT_NAME,
    config: {
      configurable: {
        user_id: user.id,
        workspace_id: workspaceId,
        model: "gpt-4.1",
        llm: "openai:gpt-4.1",
        model_config: {
          selection_mode: "performance",
        },
        tools: [],
        memory: {
          enabled: true,
          max_entries: 50,
        },
        prompt_template: SOLO_ASSISTANT_PROMPT,
        knowledge_base: {
          isEnabled: false,
          config: {
            sources: [],
          },
        },
        enabled_mcp_servers: [],
      },
    },
    metadata: {
      owner_id: user.id,
      app_source: SOLO_ASSISTANT_APP_SOURCE,
      workspace_id: workspaceId,
      description: SOLO_ASSISTANT_DESCRIPTION,
      orchestration_description:
        "A single personal assistant for general work, reasoning, writing, research, and execution support.",
      capabilities: {
        primary_role: "Personal work assistant",
        expertise_areas: [
          "research",
          "writing",
          "planning",
          "analysis",
          "execution support",
        ],
        typical_tasks: [
          "answer questions",
          "draft content",
          "summarize materials",
          "analyze tradeoffs",
          "plan next steps",
        ],
      },
      use_when:
        "Use this assistant for general work assistance across planning, writing, research, summarization, and decision support.",
      output_format:
        "Default to concise, clear answers with structure when the task benefits from it.",
    },
  });

  const assistantWithId = await langgraphClient.assistants.update(
    assistant.assistant_id,
    {
      config: {
        configurable: {
          ...assistant.config.configurable,
          assistant_id: assistant.assistant_id,
        },
      },
    },
  );

  const assistantRow = {
    assistant_id: assistantWithId.assistant_id,
    graph_id: assistantWithId.graph_id,
    name: assistantWithId.name,
    created_at: assistantWithId.created_at,
    updated_at: assistantWithId.updated_at,
    metadata: assistantWithId.metadata as Record<string, unknown>,
    config: assistantWithId.config as Record<string, unknown>,
    version: assistantWithId.version ?? 1,
    workspace_id: workspaceId,
    team_id: null,
  };

  const [assistantSync, mappingSync] = await Promise.all([
    supabaseAdmin.from("assistant").upsert(assistantRow, {
      onConflict: "assistant_id",
      ignoreDuplicates: false,
    }),
    supabaseAdmin.from("user_assistants").upsert(
      {
        user_id: user.id,
        assistant_id: assistantWithId.assistant_id,
      },
      {
        onConflict: "user_id,assistant_id",
        ignoreDuplicates: true,
      },
    ),
  ]);

  if (assistantSync.error) {
    console.error("[assistant] failed to sync solo assistant row", assistantSync.error);
  }

  if (mappingSync.error) {
    console.error("[assistant] failed to sync solo assistant mapping", mappingSync.error);
  }

  return {
    id: assistantWithId.assistant_id,
    workspaceId,
    teamId: null,
    name: assistantWithId.name?.trim() || SOLO_ASSISTANT_NAME,
    description:
      (assistantWithId.metadata as { description?: string } | undefined)?.description?.trim() ||
      SOLO_ASSISTANT_DESCRIPTION,
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

export async function isThreadOwnedByUser(
  userId: string,
  assistantId: string,
  threadId: string,
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("thread")
    .select("thread_id")
    .eq("thread_id", threadId)
    .eq("metadata->>assistant_id", assistantId)
    .eq("metadata->>user_id", userId)
    .maybeSingle();

  return Boolean(data?.thread_id);
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

type IntegrationRow = {
  id: string;
  slug: string | null;
  name: string | null;
  description: string | null;
  auth_type: string | null;
  oauth_provider: string | null;
  icon_url?: string | null;
  integration_actions?: IntegrationActionRow[] | null;
};

type IntegrationConnectionRow = {
  integration_id: string;
  auth_type: string | null;
  created_at: string | null;
  needs_reauth?: boolean | null;
};

type OfficialMcpServer = {
  serverName: string;
  displayName: string;
  description?: string;
  docsUrl?: string;
  logoUrl?: string;
  logoUrlLight?: string;
  logoUrlDark?: string;
  authType?: "oauth" | "pat" | "api_key" | "none";
  configFields?: Array<{
    key: string;
    label?: string;
    required?: boolean;
    type?: "text" | "url" | "number" | "password";
    description?: string;
    placeholder?: string;
  }>;
};

type UserMcpServerRow = {
  server_slug: string;
  is_enabled: boolean | null;
  created_at: string | null;
  needs_reauth?: boolean | null;
  oauth_token?: string | null;
};

type IntegrationActionRow = {
  id: string;
  name: string | null;
  display_name: string | null;
  description: string | null;
  category: string | null;
};

type McpCapabilityRow = {
  tools:
    | Array<{
        name?: string;
        description?: string;
      }>
    | null;
};

function normalizeAuthType(value: string | null | undefined): IntegrationAuthType {
  if (
    value === "oauth2" ||
    value === "api_key" ||
    value === "bearer" ||
    value === "basic" ||
    value === "none"
  ) {
    return value;
  }

  return "none";
}

function normalizeMcpAuthType(
  value: OfficialMcpServer["authType"] | null | undefined,
): IntegrationAuthType {
  if (value === "oauth") {
    return "oauth2";
  }

  if (value === "pat" || value === "api_key") {
    return "api_key";
  }

  if (value === "none") {
    return "none";
  }

  return "none";
}

function readOfficialMcpServers(): OfficialMcpServer[] {
  const filePath = path.resolve(
    process.cwd(),
    "../web/public/data/official-mcp-servers.json",
  );

  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const contents = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(contents) as OfficialMcpServer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function resolveMcpLogoUrl(logoPath: string | null | undefined) {
  if (!logoPath) {
    return null;
  }

  if (/^https?:\/\//i.test(logoPath)) {
    return logoPath;
  }

  if (!logoPath.startsWith("/integration-icons/")) {
    return logoPath;
  }

  const supabaseUrl = apiEnv.supabaseUrl.replace(/\/$/, "");
  const filename = logoPath.replace("/integration-icons/", "");

  return `${supabaseUrl}/storage/v1/object/public/mcp-logos/${filename}`;
}

function resolveCatalogIconUrl(iconPath: string | null | undefined) {
  if (!iconPath) {
    return null;
  }

  const trimmedIconPath = iconPath.trim();

  if (!trimmedIconPath) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmedIconPath)) {
    return trimmedIconPath;
  }

  if (trimmedIconPath.startsWith("/integration-icons/")) {
    const filename = trimmedIconPath.replace("/integration-icons/", "");
    const supabaseUrl = apiEnv.supabaseUrl.replace(/\/$/, "");
    return `${supabaseUrl}/storage/v1/object/public/mcp-logos/${filename}`;
  }

  return trimmedIconPath;
}

export async function getIntegrationCatalog(
  userId: string,
  workspaceId: string | null,
): Promise<IntegrationCatalogItem[]> {
  const [{ data: integrations }, { data: connections }] = await Promise.all([
    supabaseAdmin
      .from("integrations")
      .select(
        "id, slug, name, description, auth_type, oauth_provider, icon_url, integration_actions(id)",
      )
      .eq("is_active", true)
      .order("name"),
    workspaceId
      ? supabaseAdmin
          .from("user_integration_connections")
          .select("integration_id, auth_type, created_at, needs_reauth")
          .eq("user_id", userId)
          .eq("workspace_id", workspaceId)
      : Promise.resolve({ data: [] as IntegrationConnectionRow[] }),
  ]);

  const connectionMap = new Map(
    ((connections ?? []) as IntegrationConnectionRow[]).map((connection) => [
      connection.integration_id,
      connection,
    ]),
  );

  return ((integrations ?? []) as IntegrationRow[]).map((integration) => {
    const connection = connectionMap.get(integration.id);
    const authType = normalizeAuthType(integration.auth_type);

    return {
      id: integration.id,
      slug: integration.slug?.trim() || integration.id,
      name: integration.name?.trim() || "Untitled integration",
      description:
        integration.description?.trim() ||
        `Connect ${integration.name?.trim() || "this app"} to use it inside Solo Agents.`,
      source: "api",
      iconUrl: resolveCatalogIconUrl(integration.icon_url),
      docsUrl: null,
      authType,
      oauthProvider: integration.oauth_provider?.trim() || null,
      actionCount: integration.integration_actions?.length ?? 0,
      connection: connection
        ? {
            status: connection.needs_reauth ? "needs_reauth" : "connected",
            connectedAt: connection.created_at,
            authType: normalizeAuthType(connection.auth_type),
          }
        : null,
      };
  });
}

export async function getMcpCatalog(
  userId: string,
  workspaceId: string | null,
): Promise<IntegrationCatalogItem[]> {
  const officialServers = readOfficialMcpServers();

  const { data: userServers } = workspaceId
    ? await supabaseAdmin
        .from("user_mcp_servers")
        .select("server_slug, is_enabled, created_at, needs_reauth, oauth_token")
        .eq("user_id", userId)
        .eq("workspace_id", workspaceId)
    : { data: [] as UserMcpServerRow[] };

  const connectionMap = new Map(
    ((userServers ?? []) as UserMcpServerRow[]).map((server) => [
      server.server_slug,
      server,
    ]),
  );

  return officialServers.map((server) => {
    const connection = connectionMap.get(server.serverName);

    return {
      id: `mcp:${server.serverName}`,
      slug: server.serverName,
      name: server.displayName || server.serverName,
      description:
        server.description?.trim() ||
        `Connect ${server.displayName || server.serverName} as an MCP server.`,
      source: "mcp",
      iconUrl:
        resolveMcpLogoUrl(server.logoUrlLight) ||
        resolveMcpLogoUrl(server.logoUrl) ||
        resolveMcpLogoUrl(server.logoUrlDark),
      docsUrl: server.docsUrl?.trim() || null,
      authType: normalizeMcpAuthType(server.authType),
      oauthProvider: null,
      actionCount: 0,
      connection: connection
        ? {
            status: connection.needs_reauth ? "needs_reauth" : "connected",
            connectedAt: connection.created_at,
            authType: normalizeMcpAuthType(server.authType),
          }
        : null,
    };
  });
}

export async function getIntegrationDetail(
  userId: string,
  workspaceId: string | null,
  idOrSlug: string,
): Promise<IntegrationDetail | null> {
  const normalizedInput = idOrSlug.trim();
  const isMcp = normalizedInput.startsWith("mcp:");
  const mcpSlug = isMcp ? normalizedInput.slice(4) : normalizedInput;

  if (isMcp) {
    const officialServer = readOfficialMcpServers().find(
      (server) => server.serverName === mcpSlug,
    );

    if (!officialServer) {
      return null;
    }

    const [userServerResult, capabilityResult] = await Promise.all([
      workspaceId
        ? supabaseAdmin
            .from("user_mcp_servers")
            .select("server_slug, is_enabled, created_at, needs_reauth, oauth_token")
            .eq("user_id", userId)
            .eq("workspace_id", workspaceId)
            .eq("server_slug", mcpSlug)
            .maybeSingle()
        : Promise.resolve({ data: null as UserMcpServerRow | null }),
      workspaceId
        ? supabaseAdmin
            .from("mcp_server_capabilities")
            .select("tools")
            .eq("user_id", userId)
            .eq("workspace_id", workspaceId)
            .eq("server_slug", mcpSlug)
            .maybeSingle()
        : Promise.resolve({ data: null as McpCapabilityRow | null }),
    ]);

    const connection = userServerResult.data;
    const tools =
      capabilityResult.data?.tools?.map((tool: NonNullable<McpCapabilityRow["tools"]>[number], index: number) => ({
        id: `${mcpSlug}:${tool.name?.trim() || index + 1}`,
        name: tool.name?.trim() || `tool-${index + 1}`,
        description: tool.description?.trim() || "",
      })) ?? [];

    return {
      id: `mcp:${officialServer.serverName}`,
      slug: officialServer.serverName,
      name: officialServer.displayName || officialServer.serverName,
      description:
        officialServer.description?.trim() ||
        `Connect ${officialServer.displayName || officialServer.serverName} as an MCP server.`,
      source: "mcp",
      iconUrl:
        resolveMcpLogoUrl(officialServer.logoUrlLight) ||
        resolveMcpLogoUrl(officialServer.logoUrl) ||
        resolveMcpLogoUrl(officialServer.logoUrlDark),
      docsUrl: officialServer.docsUrl?.trim() || null,
      authType: normalizeMcpAuthType(officialServer.authType),
      oauthProvider: null,
      actionCount: 0,
      connection: connection
        ? {
            status: connection.needs_reauth ? "needs_reauth" : "connected",
            connectedAt: connection.created_at,
            authType: normalizeMcpAuthType(officialServer.authType),
          }
        : null,
      actions: [],
      tools,
      configFields:
        officialServer.configFields?.map((field) => ({
          key: field.key,
          label: field.label?.trim() || field.key,
          required: field.required,
          type: field.type,
          description: field.description?.trim(),
          placeholder: field.placeholder?.trim(),
        })) ?? [],
    };
  }

  const integrationSelect =
    "id, slug, name, description, auth_type, oauth_provider, icon_url, integration_actions(id, name, display_name, description, category)";

  const { data: byId } = await supabaseAdmin
    .from("integrations")
    .select(integrationSelect)
    .eq("is_active", true)
    .eq("id", normalizedInput)
    .maybeSingle();

  const { data: bySlug } = byId
    ? { data: null }
    : await supabaseAdmin
        .from("integrations")
        .select(integrationSelect)
        .eq("is_active", true)
        .eq("slug", normalizedInput)
        .maybeSingle();

  const integration = byId ?? bySlug;

  if (!integration) {
    return null;
  }

  const { data: connection } = workspaceId
    ? await supabaseAdmin
        .from("user_integration_connections")
        .select("integration_id, auth_type, created_at, needs_reauth")
        .eq("user_id", userId)
        .eq("workspace_id", workspaceId)
        .eq("integration_id", integration.id)
        .maybeSingle()
    : { data: null as IntegrationConnectionRow | null };

  const typedIntegration = integration as IntegrationRow;

  return {
    id: typedIntegration.id,
    slug: typedIntegration.slug?.trim() || typedIntegration.id,
    name: typedIntegration.name?.trim() || "Untitled integration",
    description:
      typedIntegration.description?.trim() ||
      `Connect ${typedIntegration.name?.trim() || "this app"} to use it inside Solo Agents.`,
    source: "api",
    iconUrl: resolveCatalogIconUrl(typedIntegration.icon_url),
    docsUrl: null,
    authType: normalizeAuthType(typedIntegration.auth_type),
    oauthProvider: typedIntegration.oauth_provider?.trim() || null,
    actionCount: typedIntegration.integration_actions?.length ?? 0,
    connection: connection
      ? {
          status: connection.needs_reauth ? "needs_reauth" : "connected",
          connectedAt: connection.created_at,
          authType: normalizeAuthType(connection.auth_type),
        }
      : null,
    actions:
      typedIntegration.integration_actions?.map((action) => ({
        id: action.id,
        name: action.name?.trim() || action.id,
        displayName: action.display_name?.trim() || action.name?.trim() || action.id,
        description: action.description?.trim() || "",
        category: action.category?.trim() || null,
      })) ?? [],
    tools: [],
    configFields: [],
  };
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
  user: AuthUser,
): Promise<AppBootstrapData | null> {
  const assistant = await ensurePrimaryAssistant(user);

  if (!assistant) {
    return null;
  }

  const workspaceId =
    assistant.workspaceId ?? (await ensureSoloWorkspaceId(user.id));
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
