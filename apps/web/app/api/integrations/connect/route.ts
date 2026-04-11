import { createClient } from "@/lib/supabase/server";

const API_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

async function getAccessToken() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function GET(request: Request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const integrationId = url.searchParams.get("integrationId");
  const targetUrl = new URL(`${API_BASE_URL}/integrations/connect`);

  if (integrationId) {
    targetUrl.searchParams.set("integrationId", integrationId);
  }

  const response = await fetch(targetUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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

export async function POST(request: Request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();

  const response = await fetch(`${API_BASE_URL}/integrations/connect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body,
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

export async function DELETE(request: Request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const integrationId = url.searchParams.get("integrationId");
  const targetUrl = new URL(`${API_BASE_URL}/integrations/connect`);

  if (integrationId) {
    targetUrl.searchParams.set("integrationId", integrationId);
  }

  const response = await fetch(targetUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
