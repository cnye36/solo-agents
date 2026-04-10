import { apiServerRequest } from "@/lib/api/server";
import type { PreferenceGroup } from "@solo-agents/types";

export async function getAssistantPreferences() {
  return apiServerRequest<{ preferences: PreferenceGroup[] }>("/account");
}

export async function saveAssistantPreferences(payload: unknown) {
  void payload;
  // TODO: Persist settings through the platform/BFF contract once finalized.
  return { success: true };
}
