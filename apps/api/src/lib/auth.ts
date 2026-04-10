import type { Context } from "hono";
import { getAuthenticatedUser } from "@/clients/supabase-auth";

export async function requireUser(c: Context) {
  const authorization = c.req.header("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "");
  const user = await getAuthenticatedUser(accessToken);

  if (!user) {
    return null;
  }

  return user;
}
