import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { assistantRoutes } from "@/routes/assistant";
import { accountRoutes } from "@/routes/account";
import { bootstrapRoutes } from "@/routes/bootstrap";
import { chatRoutes } from "@/routes/chat";
import { fileRoutes } from "@/routes/files";
import { integrationRoutes } from "@/routes/integrations";
import { threadRoutes } from "@/routes/threads";
import { apiEnv } from "@/lib/env";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

app.route("/bootstrap", bootstrapRoutes);
app.route("/assistant", assistantRoutes);
app.route("/threads", threadRoutes);
app.route("/chat", chatRoutes);
app.route("/files", fileRoutes);
app.route("/integrations", integrationRoutes);
app.route("/account", accountRoutes);

serve(
  {
    fetch: app.fetch,
    port: apiEnv.port,
  },
  (info) => {
    console.log(`solo-agents api listening on http://localhost:${info.port}`);
  },
);
