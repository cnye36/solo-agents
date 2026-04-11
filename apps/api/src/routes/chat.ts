import { Hono } from "hono";
import { createLangGraphClient } from "@/clients/langgraph";
import { supabaseAdmin } from "@/clients/supabase-admin";
import { apiEnv } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { ensurePrimaryAssistant } from "@/services/platform-data";

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

  const assistant = await ensurePrimaryAssistant(user);
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
        assistant_id: assistant.id,
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
          recursion_limit: 25,
          configurable: {
            ...assistantConfigurable,
            user_id: user.id,
            assistant_id: assistant.id,
            ...(assistant.workspaceId ? { workspace_id: assistant.workspaceId } : {}),
            ...(assistant.teamId ? { team_id: assistant.teamId } : {}),
            thread_id: threadId,
          },
        },
        stream_mode: ["messages-tuple"],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("[chat] upstream run stream failed", {
      status: response.status,
      threadId,
      assistantId: assistant.id,
      apiUrl: apiEnv.langGraphApiUrl,
      body: errorText,
    });

    return c.json(
      {
        error: "Upstream chat request failed.",
        detail: errorText,
        status: response.status,
        threadId,
        assistantId: assistant.id,
      },
      response.status as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503,
    );
  }

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
