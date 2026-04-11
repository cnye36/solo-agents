function readRequiredEnv(name: "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_ANON_KEY" | "EXPO_PUBLIC_API_BASE_URL") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to apps/mobile/.env.local before starting the Expo app.`,
    );
  }

  return value;
}

export const mobileEnv = {
  supabaseUrl: readRequiredEnv("EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readRequiredEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  apiBaseUrl: readRequiredEnv("EXPO_PUBLIC_API_BASE_URL").replace(/\/$/, ""),
};
