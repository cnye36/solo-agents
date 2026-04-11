import type { Session } from "@supabase/supabase-js";
import { mobileEnv } from "@/lib/env";

export type SendMessagePayload = {
  threadId?: string;
  message: string;
};

type StreamHandlers = {
  onThreadId?: (threadId: string) => void;
  onTextDelta?: (text: string) => void;
};

type StreamEvent = {
  event: string;
  data: string;
};

function parseStreamError(status: number, bodyText: string) {
  try {
    const data = JSON.parse(bodyText) as { error?: string };
    return new Error(data.error ?? `Chat request failed with status ${status}`);
  } catch {
    const message = bodyText.trim();
    return new Error(message || `Chat request failed with status ${status}`);
  }
}

function extractTextFromValue(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractTextFromValue(item))
      .filter(Boolean)
      .join("");
  }

  if (typeof value !== "object") {
    return "";
  }

  const record = value as Record<string, unknown>;

  if (typeof record.text === "string") {
    return record.text;
  }

  if (typeof record.content === "string") {
    return record.content;
  }

  if (Array.isArray(record.content)) {
    return record.content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (!item || typeof item !== "object") {
          return "";
        }

        const part = item as Record<string, unknown>;

        if (typeof part.text === "string") {
          return part.text;
        }

        if (typeof part.content === "string") {
          return part.content;
        }

        return extractTextFromValue(part);
      })
      .filter(Boolean)
      .join("");
  }

  if (Array.isArray(record.messages)) {
    return record.messages
      .map((message) => extractTextFromValue(message))
      .filter(Boolean)
      .join("");
  }

  if (record.data) {
    return extractTextFromValue(record.data);
  }

  if (record.chunk) {
    return extractTextFromValue(record.chunk);
  }

  return "";
}

function parseSseEvent(block: string): StreamEvent | null {
  const lines = block.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  if (!dataLines.length) {
    return null;
  }

  return {
    event,
    data: dataLines.join("\n"),
  };
}

function extractAssistantTextFromMessage(message: unknown): string {
  if (!message || typeof message !== "object") {
    return "";
  }

  const candidate = message as Record<string, unknown>;
  const rawType =
    typeof candidate.type === "string" ? candidate.type.toLowerCase() : "";
  const normalizedType = rawType.endsWith("messagechunk")
    ? rawType.slice(0, -"messagechunk".length)
    : rawType;

  if (normalizedType !== "ai" && candidate.role !== "assistant") {
    return "";
  }

  return extractTextFromValue(candidate.content);
}

function shouldAcceptTupleMetadata(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") {
    return true;
  }

  const record = metadata as Record<string, unknown>;
  const node =
    typeof record.langgraph_node === "string" ? record.langgraph_node : null;

  if (!node) {
    return true;
  }

  return node === "agent";
}

function extractTextFromStreamEvent(streamEvent: StreamEvent): string {
  const payload = streamEvent.data.trim();

  if (!payload || payload === "[DONE]") {
    return "";
  }

  try {
    const parsed = JSON.parse(payload) as unknown;

    if (streamEvent.event === "messages") {
      if (Array.isArray(parsed) && parsed.length > 1) {
        if (!shouldAcceptTupleMetadata(parsed[1])) {
          return "";
        }

        return extractAssistantTextFromMessage(parsed[0]);
      }

      return "";
    }

    if (streamEvent.event === "messages/partial") {
      if (!Array.isArray(parsed)) {
        return "";
      }

      return parsed
        .map((message) => extractAssistantTextFromMessage(message))
        .filter(Boolean)
        .join("");
    }

    return "";
  } catch {
    return streamEvent.event === "messages" ? payload : "";
  }
}

function consumeBlock(block: string, handlers: StreamHandlers) {
  const streamEvent = parseSseEvent(block);

  if (!streamEvent) {
    return;
  }

  if (
    streamEvent.event !== "messages" &&
    streamEvent.event !== "messages/partial"
  ) {
    return;
  }

  const text = extractTextFromStreamEvent(streamEvent);

  if (text) {
    handlers.onTextDelta?.(text);
  }
}

function splitSseBuffer(buffer: string) {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const blocks = normalized.split("\n\n");

  return {
    completeBlocks: blocks.slice(0, -1),
    remainder: blocks.at(-1) ?? "",
  };
}

export async function sendMessageStream(
  session: Session | null,
  payload: SendMessagePayload,
  handlers: StreamHandlers = {},
) {
  const response = await fetch(`${mobileEnv.apiBaseUrl}/chat/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw parseStreamError(response.status, await response.text());
  }

  const threadId = response.headers.get("x-thread-id") ?? undefined;

  if (threadId) {
    handlers.onThreadId?.(threadId);
  }

  if (!response.body) {
    return { threadId };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const { completeBlocks, remainder } = splitSseBuffer(buffer);
    buffer = remainder;

    for (const block of completeBlocks) {
      consumeBlock(block, handlers);
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    consumeBlock(buffer, handlers);
  }

  return { threadId };
}
