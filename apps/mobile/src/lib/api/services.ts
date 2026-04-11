import type {
  AppBootstrapData,
  IntegrationCatalogItem,
  KnowledgeFile,
  PreferenceGroup,
  ThreadSummary,
} from "@solo-agents/types";
import type { Session } from "@supabase/supabase-js";
import { apiRequest } from "@/lib/api/client";

export async function getAppBootstrapData(session: Session | null) {
  return apiRequest<AppBootstrapData | { assistant: null; onboardingComplete: false }>(
    "/bootstrap",
    {
      session,
      method: "GET",
    },
  );
}

export async function listThreads(session: Session | null) {
  return apiRequest<{ threads: ThreadSummary[] }>("/threads", {
    session,
    method: "GET",
  });
}

export async function listKnowledgeFiles(session: Session | null) {
  return apiRequest<{ files: KnowledgeFile[] }>("/files", {
    session,
    method: "GET",
  });
}

export async function listIntegrationCatalog(session: Session | null) {
  return apiRequest<{ apps: IntegrationCatalogItem[] }>("/integrations/catalog", {
    session,
    method: "GET",
  });
}

export async function saveIntegrationConnection(
  session: Session | null,
  payload: {
    integrationId: string;
    apiKey?: string;
    accessToken?: string;
    basicAuthUsername?: string;
    basicAuthPassword?: string;
  },
) {
  return apiRequest<{ connection: unknown }>("/integrations/connect", {
    session,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function disconnectIntegration(
  session: Session | null,
  integrationId: string,
) {
  return apiRequest<{ success: true }>(
    `/integrations/connect?integrationId=${encodeURIComponent(integrationId)}`,
    {
      session,
      method: "DELETE",
    },
  );
}

export async function getAccountSummary(session: Session | null) {
  return apiRequest<{
    email: string;
    billing: AppBootstrapData["billing"];
    preferences: PreferenceGroup[];
  }>("/account", {
    session,
    method: "GET",
  });
}
