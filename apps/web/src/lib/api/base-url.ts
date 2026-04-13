/**
 * Base URL for server-side calls to the Hono BFF.
 * Empty strings in env are ignored so `??` fallbacks still work.
 */
export function resolveServerApiBaseUrl(): string {
  const candidates = [process.env.API_BASE_URL, process.env.NEXT_PUBLIC_API_BASE_URL];

  for (const raw of candidates) {
    if (typeof raw !== "string") {
      continue;
    }
    const trimmed = raw.replace(/\/$/, "").trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "http://127.0.0.1:4000";
}
