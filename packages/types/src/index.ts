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

export type ConnectedApp = {
  id: string;
  name: string;
  status: "connected" | "available" | "error";
  summary: string;
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
