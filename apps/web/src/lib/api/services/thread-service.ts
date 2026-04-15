import type { ThreadChatMessage } from "@solo-agents/types";

export async function fetchThreadMessages(
  threadId: string,
  init?: { signal?: AbortSignal },
): Promise<ThreadChatMessage[]> {
  const response = await fetch(
    `/api/threads/${encodeURIComponent(threadId)}`,
    {
      cache: "no-store",
      signal: init?.signal,
    },
  );

  const raw = await response.text();
  let parsed: { error?: string; messages?: ThreadChatMessage[] };

  try {
    parsed = JSON.parse(raw) as { error?: string; messages?: ThreadChatMessage[] };
  } catch {
    throw new Error(
      response.ok
        ? "Invalid response when loading thread."
        : raw.trim() || `Unable to load thread (${response.status})`,
    );
  }

  if (response.ok) {
    if (Array.isArray(parsed.messages)) {
      return parsed.messages;
    }

    throw new Error("Invalid response when loading thread.");
  }

  throw new Error(
    typeof parsed.error === "string"
      ? parsed.error
      : `Unable to load thread (${response.status})`,
  );
}
