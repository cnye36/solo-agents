export type NavItem = {
  href: string;
  label: string;
};

export type AssistantSummary = {
  id: string;
  name: string;
  status: "ready" | "provisioning" | "error";
  description: string;
};

export type ThreadSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
};

/** Normalized message from LangGraph thread state (API → web chat UI). */
export type ThreadChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ConnectedApp = {
  id: string;
  name: string;
  status: "connected" | "available" | "error";
  summary: string;
};

export type IntegrationAuthType =
  | "oauth2"
  | "api_key"
  | "bearer"
  | "basic"
  | "none";

export type IntegrationConnectionStatus =
  | "connected"
  | "available"
  | "needs_reauth";

export type IntegrationCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  source: "api" | "mcp";
  iconUrl: string | null;
  docsUrl: string | null;
  authType: IntegrationAuthType;
  oauthProvider: string | null;
  actionCount: number;
  connection: {
    status: IntegrationConnectionStatus;
    connectedAt: string | null;
    authType: IntegrationAuthType | null;
  } | null;
};

export type IntegrationDetail = IntegrationCatalogItem & {
  actions: Array<{
    id: string;
    name: string;
    displayName: string;
    description: string;
    category: string | null;
  }>;
  tools: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  configFields: Array<{
    key: string;
    label: string;
    required?: boolean;
    type?: "text" | "url" | "number" | "password";
    description?: string;
    placeholder?: string;
  }>;
};

export type KnowledgeFile = {
  id: string;
  name: string;
  status: "ready" | "processing" | "failed";
  sizeLabel: string;
};

export type PreferenceGroup = {
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: string;
  }>;
};

export type AppBootstrapData = {
  user: {
    firstName: string;
    email: string;
  };
  assistant: AssistantSummary;
  recentThreads: ThreadSummary[];
  connectedApps: ConnectedApp[];
  files: KnowledgeFile[];
  preferences: PreferenceGroup[];
  onboardingComplete: boolean;
  billing: {
    planName: string;
    renewalLabel: string;
  };
};
