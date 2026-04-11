import { Hono } from "hono";
import { requireUser } from "@/lib/auth";
import { ensurePrimaryAssistant, getKnowledgeFiles } from "@/services/platform-data";

export const fileRoutes = new Hono();

fileRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await ensurePrimaryAssistant(user);

  if (!assistant) {
    return c.json({ files: [] });
  }

  const files = await getKnowledgeFiles(assistant.id);
  return c.json({ files });
});
