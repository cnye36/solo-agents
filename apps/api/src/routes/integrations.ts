import { Hono } from "hono";
import { requireUser } from "@/lib/auth";
import {
  getConnectedApps,
  getIntegrationCatalog,
  getIntegrationDetail,
  getMcpCatalog,
} from "@/services/platform-data";
import { ensureSoloWorkspaceId } from "@/services/solo-workspace";
import { supabaseAdmin } from "@/clients/supabase-admin";

export const integrationRoutes = new Hono();

integrationRoutes.get("/", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const workspaceId = await ensureSoloWorkspaceId(user.id);
  const apps = await getConnectedApps(user.id, workspaceId);

  return c.json({ apps });
});

integrationRoutes.get("/catalog", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const workspaceId = await ensureSoloWorkspaceId(user.id);
  const [apiApps, mcpApps] = await Promise.all([
    getIntegrationCatalog(user.id, workspaceId),
    getMcpCatalog(user.id, workspaceId),
  ]);

  const apps = [...apiApps, ...mcpApps].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
  );

  return c.json({ apps });
});

integrationRoutes.get("/catalog/:id", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const id = c.req.param("id");

  if (!id) {
    return c.json({ error: "Integration id is required." }, 400);
  }

  const workspaceId = await ensureSoloWorkspaceId(user.id);
  const integration = await getIntegrationDetail(user.id, workspaceId, id);

  if (!integration) {
    return c.json({ error: "Integration not found." }, 404);
  }

  return c.json({ integration });
});

integrationRoutes.get("/connect", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const integrationId = c.req.query("integrationId");

  if (!integrationId) {
    return c.json({ error: "integrationId is required." }, 400);
  }

  const workspaceId = await ensureSoloWorkspaceId(user.id);

  const { data: connection } = await supabaseAdmin
    .from("user_integration_connections")
    .select("id, integration_id, auth_type, created_at, needs_reauth")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .eq("integration_id", integrationId)
    .maybeSingle();

  return c.json({ connection: connection ?? null });
});

integrationRoutes.post("/connect", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{
    integrationId?: string;
    apiKey?: string;
    accessToken?: string;
    basicAuthUsername?: string;
    basicAuthPassword?: string;
  }>();

  if (!body.integrationId) {
    return c.json({ error: "integrationId is required." }, 400);
  }

  const workspaceId = await ensureSoloWorkspaceId(user.id);

  const { data: integration } = await supabaseAdmin
    .from("integrations")
    .select("id, auth_type")
    .eq("id", body.integrationId)
    .maybeSingle();

  if (!integration) {
    return c.json({ error: "Integration not found." }, 404);
  }

  const expectedAuth = integration.auth_type;
  const row: Record<string, unknown> = {
    user_id: user.id,
    workspace_id: workspaceId,
    integration_id: body.integrationId,
    needs_reauth: false,
  };

  if (expectedAuth === "basic") {
    const username = body.basicAuthUsername?.trim() ?? "";
    const password = body.basicAuthPassword?.trim() ?? "";

    if (!username || !password) {
      return c.json({ error: "Username and password are required." }, 400);
    }

    row.auth_type = "basic";
    row.basic_auth_username = username;
    row.basic_auth_password = password;
    row.api_key = null;
    row.access_token = null;
    row.refresh_token = null;
    row.token_expires_at = null;
  } else if (expectedAuth === "bearer") {
    const token = body.accessToken?.trim() ?? "";

    if (!token) {
      return c.json({ error: "Access token is required." }, 400);
    }

    row.auth_type = "bearer";
    row.access_token = token;
    row.api_key = null;
    row.basic_auth_username = null;
    row.basic_auth_password = null;
    row.refresh_token = null;
    row.token_expires_at = null;
  } else if (expectedAuth === "api_key") {
    const apiKey = body.apiKey?.trim() ?? "";

    if (!apiKey) {
      return c.json({ error: "API key is required." }, 400);
    }

    row.auth_type = "api_key";
    row.api_key = apiKey;
    row.access_token = null;
    row.basic_auth_username = null;
    row.basic_auth_password = null;
    row.refresh_token = null;
    row.token_expires_at = null;
  } else if (expectedAuth === "none") {
    row.auth_type = "none";
    row.api_key = null;
    row.access_token = null;
    row.basic_auth_username = null;
    row.basic_auth_password = null;
    row.refresh_token = null;
    row.token_expires_at = null;
  } else if (expectedAuth === "oauth2") {
    return c.json(
      { error: "OAuth integrations must be connected through the OAuth flow." },
      400,
    );
  } else {
    return c.json({ error: "Unsupported integration auth type." }, 400);
  }

  const { data: connection, error } = await supabaseAdmin
    .from("user_integration_connections")
    .upsert(row, {
      onConflict: "user_id,workspace_id,integration_id",
      ignoreDuplicates: false,
    })
    .select("id, integration_id, auth_type, created_at, needs_reauth")
    .single();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ connection }, 200);
});

integrationRoutes.delete("/connect", async (c) => {
  const user = await requireUser(c);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const integrationId = c.req.query("integrationId");

  if (!integrationId) {
    return c.json({ error: "integrationId is required." }, 400);
  }

  const workspaceId = await ensureSoloWorkspaceId(user.id);

  const { error } = await supabaseAdmin
    .from("user_integration_connections")
    .delete()
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .eq("integration_id", integrationId);

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json({ success: true });
});
