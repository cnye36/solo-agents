import { Hono } from "hono";
import { requireUser } from "@/lib/auth";
import { getActiveWorkspaceId, getConnectedApps } from "@/services/platform-data";

export const integrationRoutes = new Hono();

integrationRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const workspaceId = await getActiveWorkspaceId(user.id);
  const apps = await getConnectedApps(user.id, workspaceId);

  return c.json({ apps });
});
