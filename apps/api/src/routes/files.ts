import { Hono } from "hono";
import { requireUser } from "@/lib/auth";
import { getKnowledgeFiles, getPrimaryAssistant } from "@/services/platform-data";

export const fileRoutes = new Hono();

fileRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await getPrimaryAssistant(user.id);

  if (!assistant) {
    return c.json({ files: [] });
  }

  const files = await getKnowledgeFiles(assistant.id);
  return c.json({ files });
});
