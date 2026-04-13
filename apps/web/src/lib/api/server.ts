import { createClient } from "@/lib/supabase/server";
import { resolveServerApiBaseUrl } from "@/lib/api/base-url";

export async function apiServerRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const apiBaseUrl = resolveServerApiBaseUrl();
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = `${apiBaseUrl}${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: session?.access_token
        ? {
            Authorization: `Bearer ${session.access_token}`,
            ...(init.headers ?? {}),
          }
        : init.headers,
      cache: "no-store",
    });
  } catch (cause) {
    throw new Error(
      [
        `Could not reach the API at ${url}.`,
        "Start the BFF from the repo root: pnpm dev:api",
        "Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL in apps/web/.env.local if the API is not on port 4000.",
        "On some systems use http://127.0.0.1:4000 instead of localhost if fetch fails with connection errors.",
      ].join(" "),
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
