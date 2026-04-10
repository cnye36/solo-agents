import { Hono } from "hono";
import { createLangGraphClient } from "@/clients/langgraph";
import { requireUser } from "@/lib/auth";
import { getPrimaryAssistant, getRecentThreads } from "@/services/platform-data";

export const threadRoutes = new Hono();

threadRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await getPrimaryAssistant(user.id);

  if (!assistant) {
    return c.json({ threads: [] });
  }

  const threads = await getRecentThreads(user.id, assistant.id);
  return c.json({ threads });
});

threadRoutes.post("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await getPrimaryAssistant(user.id);
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
