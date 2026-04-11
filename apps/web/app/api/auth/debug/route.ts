import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return Response.json({
    cookieNames: cookieStore.getAll().map((cookie) => cookie.name),
    hasUser: Boolean(user),
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    hasSession: Boolean(session),
    accessTokenPrefix: session?.access_token?.slice(0, 12) ?? null,
  });
}
