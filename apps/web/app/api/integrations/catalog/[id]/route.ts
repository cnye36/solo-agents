import { createClient } from "@/lib/supabase/server";
import { resolveServerApiBaseUrl } from "@/lib/api/base-url";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiBaseUrl = resolveServerApiBaseUrl();
  const response = await fetch(
    `${apiBaseUrl}/integrations/catalog/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    },
  );

  const bodyText = await response.text();

  return new Response(bodyText, {
    status: response.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
