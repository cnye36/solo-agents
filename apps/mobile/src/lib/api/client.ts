import type { Session } from "@supabase/supabase-js";
import { mobileEnv } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

type ApiRequestOptions = RequestInit & {
  session: Session | null;
};

export async function apiRequest<T>(
  path: string,
  { session, headers, ...init }: ApiRequestOptions,
): Promise<T> {
  const response = await fetch(`${mobileEnv.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
      ...(headers ?? {}),
    },
  });

  if (!response.ok) {
    const bodyText = await response.text();

    try {
      const parsed = JSON.parse(bodyText) as { error?: string; detail?: string };
      throw new ApiError(
        parsed.detail ?? parsed.error ?? `API request failed with status ${response.status}.`,
        response.status,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(bodyText.trim() || `API request failed with status ${response.status}.`, response.status);
    }
  }

  return (await response.json()) as T;
}
