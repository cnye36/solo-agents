import { Client } from "@langchain/langgraph-sdk";
import { apiEnv } from "@/lib/env";

export function createLangGraphClient() {
  if (!apiEnv.langGraphApiUrl || !apiEnv.langSmithApiKey) {
    return null;
  }

  return new Client({
    apiUrl: apiEnv.langGraphApiUrl,
    apiKey: apiEnv.langSmithApiKey,
  });
}
