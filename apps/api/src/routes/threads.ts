import { Hono } from "hono";
import { createLangGraphClient } from "@/clients/langgraph";
import { requireUser } from "@/lib/auth";
import {
  ensurePrimaryAssistant,
  getRecentThreads,
  isThreadOwnedByUser,
} from "@/services/platform-data";
import { chatMessagesFromThreadValues } from "@/services/thread-chat-messages";

export const threadRoutes = new Hono();

threadRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await ensurePrimaryAssistant(user);

  if (!assistant) {
    return c.json({ threads: [] });
  }

  const threads = await getRecentThreads(user.id, assistant.id);
  return c.json({ threads });
});

threadRoutes.get("/:threadId", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const threadId = c.req.param("threadId");

  if (!threadId) {
    return c.json({ error: "Thread id is required" }, 400);
  }

  const assistant = await ensurePrimaryAssistant(user);

  if (!assistant) {
    return c.json({ error: "Assistant not available" }, 503);
  }

  const allowed = await isThreadOwnedByUser(user.id, assistant.id, threadId);

  if (!allowed) {
    return c.json({ error: "Thread not found" }, 404);
  }

  const langGraph = createLangGraphClient();

  if (!langGraph) {
    return c.json({ error: "Chat runtime is not configured." }, 503);
  }

  try {
    const state = await langGraph.threads.getState(threadId);
    const messages = chatMessagesFromThreadValues(state.values);

    return c.json({ messages });
  } catch (error) {
    console.error("[threads] getState failed", { threadId, error });

    return c.json(
      { error: "Unable to load conversation state from the assistant runtime." },
      502,
    );
  }
});

threadRoutes.post("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await ensurePrimaryAssistant(user);
  const langGraph = createLangGraphClient();

  if (!assistant || !langGraph) {
    return c.json(
      { error: "Thread creation is not configured yet." },
      503,
    );
  }

  const thread = await langGraph.threads.create({
    metadata: {
      user_id: user.id,
      assistant_id: assistant.id,
      ...(assistant.workspaceId ? { workspace_id: assistant.workspaceId } : {}),
      ...(assistant.teamId ? { team_id: assistant.teamId } : {}),
    },
  });

  return c.json({ threadId: thread.thread_id }, 201);
});
