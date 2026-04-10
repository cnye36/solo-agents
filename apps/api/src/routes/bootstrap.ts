import { Hono } from "hono";
import { requireUser } from "@/lib/auth";
import { buildBootstrapData } from "@/services/platform-data";

export const bootstrapRoutes = new Hono();

bootstrapRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const data = await buildBootstrapData(user);

  if (!data) {
    return c.json(
      {
        onboardingComplete: false,
        assistant: null,
      },
      200,
    );
  }

  return c.json(data);
});
