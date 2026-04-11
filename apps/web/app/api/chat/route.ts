import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
        detail: "No authenticated Supabase user was found for this request.",
        cookieNames: cookieStore.getAll().map((cookie) => cookie.name),
      },
      { status: 401 },
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return Response.json(
      {
        error: "Unauthorized",
        detail:
          "Authenticated user found, but no access token is available in the server session.",
        userId: user.id,
        cookieNames: cookieStore.getAll().map((cookie) => cookie.name),
      },
      { status: 401 },
    );
  }

  const payload = await request.json();

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { error: `Unable to reach the backend chat API at ${API_BASE_URL}.` },
      { status: 502 },
    );
  }

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ??
        "application/x-ndjson; charset=utf-8",
      "x-thread-id": response.headers.get("x-thread-id") ?? "",
    },
  });
}
