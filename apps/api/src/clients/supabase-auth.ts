import { createClient } from "@supabase/supabase-js";
import { apiEnv } from "@/lib/env";

const supabaseAuth = createClient(apiEnv.supabaseUrl, apiEnv.supabaseAnonKey);

export async function getAuthenticatedUser(accessToken?: string) {
  if (!accessToken) {
    return null;
  }

  const { data, error } = await supabaseAuth.auth.getUser(accessToken);

  if (error) {
    return null;
  }

  return data.user ?? null;
}
