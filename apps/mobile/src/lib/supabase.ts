import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { mobileEnv } from "@/lib/env";

/**
 * `expo-secure-store` is native-only. Expo Web has no SecureStore implementation, so we persist
 * the Supabase session in `localStorage` when running in the browser (handy for quick checks;
 * use iOS/Android for real secure storage testing).
 */
const webAuthStorage = {
  async getItem(key: string) {
    if (typeof globalThis.localStorage === "undefined") {
      return null;
    }
    return globalThis.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof globalThis.localStorage === "undefined") {
      return;
    }
    globalThis.localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (typeof globalThis.localStorage === "undefined") {
      return;
    }
    globalThis.localStorage.removeItem(key);
  },
};

const nativeAuthStorage = {
  async getItem(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string) {
    await SecureStore.deleteItemAsync(key);
  },
};

const storage = Platform.OS === "web" ? webAuthStorage : nativeAuthStorage;

export const supabase = createClient(
  mobileEnv.supabaseUrl,
  mobileEnv.supabaseAnonKey,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
