import { apiServerRequest } from "@/lib/api/server";
import type { ThreadSummary } from "@solo-agents/types";

export async function listThreads() {
  return apiServerRequest<{ threads: ThreadSummary[] }>("/threads");
}

export async function createThread() {
  return apiServerRequest<{ threadId: string }>("/threads", {
    method: "POST",
  } as RequestInit);
}
