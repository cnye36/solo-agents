import { apiServerRequest } from "@/lib/api/server";
import type { ConnectedApp } from "@solo-agents/types";

export async function listConnectedApps() {
  return apiServerRequest<{ apps: ConnectedApp[] }>("/integrations");
}

export async function startIntegrationConnect(slug: string) {
  void slug;
  // TODO: Map to existing OAuth / MCP-backed auth flow in AffinityBots.
  return { status: "pending" as const };
}
