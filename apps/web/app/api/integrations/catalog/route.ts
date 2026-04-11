import { createClient } from "@/lib/supabase/server";

const API_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_BASE_URL}/integrations/catalog`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const bodyText = await response.text();

  return new Response(bodyText, {
    status: response.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
