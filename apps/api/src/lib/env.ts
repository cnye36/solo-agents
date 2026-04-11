import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

const envDir = process.cwd();
loadEnvFile(path.join(envDir, ".env"));
loadEnvFile(path.join(envDir, ".env.local"));

function getRequired(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const apiEnv = {
  port: Number(process.env.API_PORT ?? 4000),
  affinityBotsBaseUrl:
    process.env.AFFINITYBOTS_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000",
  langGraphApiUrl: process.env.LANGGRAPH_API_URL?.replace(/\/$/, "") ?? "",
  langSmithApiKey: process.env.LANGSMITH_API_KEY ?? "",
  supabaseUrl: getRequired("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getRequired("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: getRequired("SUPABASE_SERVICE_ROLE_KEY"),
};
