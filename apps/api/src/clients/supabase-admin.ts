import { createClient } from "@supabase/supabase-js";
import { apiEnv } from "@/lib/env";

export const supabaseAdmin = createClient(
  apiEnv.supabaseUrl,
  apiEnv.supabaseServiceRoleKey,
);
