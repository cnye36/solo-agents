import { Hono } from "hono";
import { createLangGraphClient } from "@/clients/langgraph";
import { supabaseAdmin } from "@/clients/supabase-admin";
import { apiEnv } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { getPrimaryAssistant } from "@/services/platform-data";

export const chatRoutes = new Hono();

chatRoutes.post("/send", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{
    message: string;
    threadId?: string;
  }>();

  const assistant = await getPrimaryAssistant(user.id);
  const langGraphClient = createLangGraphClient();

  if (!assistant || !langGraphClient) {
    return c.json({ error: "Chat is not configured yet." }, 503);
  }

  const { data: assistantRow } = await supabaseAdmin
    .from("assistant")
    .select("config, metadata")
    .eq("assistant_id", assistant.id)
    .maybeSingle();

  const assistantConfigurable =
    ((assistantRow?.config as { configurable?: Record<string, unknown> } | null)
      ?.configurable ?? {}) as Record<string, unknown>;

  const threadId =
    body.threadId ??
    (
      await langGraphClient.threads.create({
        metadata: {
          user_id: user.id,
          assistant_id: assistant.id,
          ...(assistant.workspaceId ? { workspace_id: assistant.workspaceId } : {}),
          ...(assistant.teamId ? { team_id: assistant.teamId } : {}),
        },
      })
    ).thread_id;

  const response = await fetch(
    `${apiEnv.langGraphApiUrl}/threads/${threadId}/runs/stream`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiEnv.langSmithApiKey,
      },
      body: JSON.stringify({
        input: {
          messages: [{ type: "human", content: body.message }],
        },
        metadata: {
          user_id: user.id,
          assistant_id: assistant.id,
          ...(assistant.workspaceId ? { workspace_id: assistant.workspaceId } : {}),
          ...(assistant.teamId ? { team_id: assistant.teamId } : {}),
          thread_id: threadId,
        },
        config: {
          configurable: {
            ...assistantConfigurable,
            user_id: user.id,
            assistant_id: assistant.id,
            ...(assistant.workspaceId ? { workspace_id: assistant.workspaceId } : {}),
            ...(assistant.teamId ? { team_id: assistant.teamId } : {}),
            thread_id: threadId,
          },
        },
        stream_mode: ["messages", "messages-tuple"],
      }),
    },
  );

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ??
        "application/x-ndjson; charset=utf-8",
      "x-thread-id": threadId,
    },
  });
});
