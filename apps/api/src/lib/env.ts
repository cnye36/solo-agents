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
