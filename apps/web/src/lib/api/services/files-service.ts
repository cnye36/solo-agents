import { apiServerRequest } from "@/lib/api/server";
import type { KnowledgeFile } from "@solo-agents/types";

export async function listKnowledgeFiles() {
  return apiServerRequest<{ files: KnowledgeFile[] }>("/files");
}

export async function uploadKnowledgeFile(formData: FormData) {
  void formData;
  // TODO: Add multipart upload support via the BFF and existing AffinityBots knowledge endpoint.
  return { success: true };
}
