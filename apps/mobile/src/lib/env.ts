import { Platform } from "react-native";

function readRequiredEnv(name: "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_ANON_KEY" | "EXPO_PUBLIC_API_BASE_URL") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to apps/mobile/.env.local before starting the Expo app.`,
    );
  }

  return value;
}

function readOptionalEnv(name: "EXPO_PUBLIC_API_ANDROID_HOST") {
  return process.env[name]?.trim() ?? "";
}

/**
 * Android dev: `EXPO_PUBLIC_API_BASE_URL` often uses 127.0.0.1. That is wrong in two cases:
 * (1) Emulator: 127.0.0.1 is the emulator, not your PC (some setups use 10.0.2.2 to reach the host).
 * (2) WSL2: the API runs in Linux; Windows `localhost:port` often does NOT forward to WSL, so 10.0.2.2
 *     (host loopback from the emulator) still fails. Use your WSL IP from `hostname -I` instead.
 *
 * Set `EXPO_PUBLIC_API_ANDROID_HOST` to the host the emulator can reach (WSL IP for API-in-WSL, or
 * `10.0.2.2` if the API listens on Windows localhost). Run `pnpm android:print-api-host` in apps/mobile.
 */
function resolveApiBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  const androidHost = readOptionalEnv("EXPO_PUBLIC_API_ANDROID_HOST");

  if (
    !__DEV__ ||
    Platform.OS !== "android" ||
    !androidHost ||
    !/^(https?:\/\/)(127\.0\.0\.1|localhost)(:\d+)?(\/.*)?$/i.test(trimmed)
  ) {
    return trimmed;
  }

  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`);
    u.hostname = androidHost;
    return u.toString().replace(/\/$/, "");
  } catch {
    return trimmed.replace(/127\.0\.0\.1|localhost/i, androidHost);
  }
}

export const mobileEnv = {
  supabaseUrl: readRequiredEnv("EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readRequiredEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  apiBaseUrl: resolveApiBaseUrl(readRequiredEnv("EXPO_PUBLIC_API_BASE_URL")),
};
