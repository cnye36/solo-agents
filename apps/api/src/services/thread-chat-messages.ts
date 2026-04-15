import type { ThreadChatMessage } from "@solo-agents/types";

function extractContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (!part || typeof part !== "object") {
        return "";
      }

      const block = part as Record<string, unknown>;

      if (typeof block.text === "string") {
        return block.text;
      }

      if (block.type === "text" && typeof block.text === "string") {
        return block.text;
      }

      return "";
    })
    .filter(Boolean)
    .join("");
}

/**
 * Maps LangGraph checkpoint `values.messages` (LangChain serialized messages) into UI rows.
 */
export function chatMessagesFromThreadValues(values: unknown): ThreadChatMessage[] {
  if (!values || typeof values !== "object") {
    return [];
  }

  const record = values as Record<string, unknown>;
  const raw = record.messages;

  if (!Array.isArray(raw)) {
    return [];
  }

  const out: ThreadChatMessage[] = [];

  for (let i = 0; i < raw.length; i += 1) {
    const item = raw[i];

    if (!item || typeof item !== "object") {
      continue;
    }

    const msg = item as Record<string, unknown>;
    const type =
      typeof msg.type === "string" ? msg.type.toLowerCase() : "";
    const roleRaw =
      typeof msg.role === "string" ? msg.role.toLowerCase() : "";

    let role: "user" | "assistant" | null = null;

    if (type === "human" || roleRaw === "user") {
      role = "user";
    } else if (
      type === "ai" ||
      type === "assistant" ||
      roleRaw === "assistant"
    ) {
      role = "assistant";
    } else {
      continue;
    }

    const content = extractContent(msg.content);
    const id =
      typeof msg.id === "string" && msg.id.length > 0 ? msg.id : `${role}-${i}`;
    const createdAt =
      typeof msg.created_at === "string"
        ? msg.created_at
        : new Date(Date.now() + i * 1000).toISOString();

    out.push({ id, role, content, createdAt });
  }

  return out;
}
