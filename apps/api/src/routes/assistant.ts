import { Hono } from "hono";
import { ensurePrimaryAssistant, getPrimaryAssistant } from "@/services/platform-data";
import { requireUser } from "@/lib/auth";

export const assistantRoutes = new Hono();

assistantRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await ensurePrimaryAssistant(user);
  return c.json({ assistant });
});

assistantRoutes.post("/provision", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingAssistant = await getPrimaryAssistant(user.id);

  if (existingAssistant) {
    return c.json({ assistant: existingAssistant }, 200);
  }

  const assistant = await ensurePrimaryAssistant(user);

  if (!assistant) {
    return c.json(
      {
        error: "Assistant provisioning is not configured yet.",
      },
      503,
    );
  }

  return c.json({ assistant }, 201);
});
