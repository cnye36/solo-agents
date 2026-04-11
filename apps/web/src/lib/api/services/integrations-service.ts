import { apiServerRequest } from "@/lib/api/server";
import type {
  ConnectedApp,
  IntegrationCatalogItem,
  IntegrationDetail,
} from "@solo-agents/types";

export async function listConnectedApps() {
  return apiServerRequest<{ apps: ConnectedApp[] }>("/integrations");
}

export async function listIntegrationCatalog() {
  return apiServerRequest<{ apps: IntegrationCatalogItem[] }>(
    "/integrations/catalog",
  );
}

export async function getIntegrationDetail(id: string) {
  return apiServerRequest<{ integration: IntegrationDetail }>(
    `/integrations/catalog/${encodeURIComponent(id)}`,
  );
}

export async function startIntegrationConnect(slug: string) {
  void slug;
  // TODO: Map to existing OAuth / MCP-backed auth flow in AffinityBots.
  return { status: "pending" as const };
}
