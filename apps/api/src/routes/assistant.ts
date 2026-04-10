import { Hono } from "hono";
import { getPrimaryAssistant } from "@/services/platform-data";
import { requireUser } from "@/lib/auth";

export const assistantRoutes = new Hono();

assistantRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await getPrimaryAssistant(user.id);
  return c.json({ assistant });
});

assistantRoutes.post("/provision", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const assistant = await getPrimaryAssistant(user.id);

  if (assistant) {
    return c.json({ assistant }, 200);
  }

  return c.json(
    {
      error:
        "Automatic assistant provisioning is not wired yet. The next step is to connect this endpoint to the existing assistant creation flow.",
    },
    501,
  );
});
