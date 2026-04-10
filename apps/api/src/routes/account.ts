import { Hono } from "hono";
import { requireUser } from "@/lib/auth";
import { getBillingSummary, getPreferenceGroups } from "@/services/platform-data";

export const accountRoutes = new Hono();

accountRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [billing, preferences] = await Promise.all([
    getBillingSummary(user.id),
    getPreferenceGroups(user.id),
  ]);

  return c.json({
    email: user.email ?? "",
    billing,
    preferences,
  });
});
