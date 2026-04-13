import Link from "next/link";
import { notFound } from "next/navigation";
import type { IntegrationAuthType, IntegrationDetail } from "@solo-agents/types";
import { getIntegrationDetail } from "@/lib/api/services/integrations-service";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function authTypeLabel(authType: IntegrationAuthType) {
  switch (authType) {
    case "oauth2":
      return "OAuth";
    case "api_key":
      return "API Key";
    case "bearer":
      return "Bearer Token";
    case "basic":
      return "Basic Auth";
    default:
      return "No Auth";
  }
}

function sourceLabel(source: IntegrationDetail["source"]) {
  return source === "mcp" ? "MCP Server" : "API Integration";
}

function statusLabel(integration: IntegrationDetail) {
  if (!integration.connection) {
    return "Available";
  }

  if (integration.connection.status === "needs_reauth") {
    return "Reconnect required";
  }

  return "Connected";
}

function IntegrationLogo({ integration }: { integration: IntegrationDetail }) {
  if (integration.iconUrl) {
    return (
      <img
        src={integration.iconUrl}
        alt=""
        className="h-16 w-16 rounded-3xl border border-white/10 bg-white p-3 object-contain shadow-[0_16px_36px_rgba(0,0,0,0.22)]"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-lg font-semibold uppercase tracking-[0.18em] text-zinc-300">
      {integration.name.slice(0, 2)}
    </div>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300">
      {label}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-zinc-900/40 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function IntegrationDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  let data: Awaited<ReturnType<typeof getIntegrationDetail>>;

  try {
    data = await getIntegrationDetail(id);
  } catch {
    notFound();
  }

  const integration = data.integration;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/integrations"
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.04]"
        >
          Back
        </Link>
        {integration.docsUrl ? (
          <a
            href={integration.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.04]"
          >
            Open docs
          </a>
        ) : null}
      </div>

      <section className="rounded-[32px] border border-white/10 bg-zinc-900/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <IntegrationLogo integration={integration} />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <StatPill label={sourceLabel(integration.source)} />
                <StatPill label={authTypeLabel(integration.authType)} />
                <StatPill label={statusLabel(integration)} />
                {integration.actionCount > 0 ? (
                  <StatPill label={`${integration.actionCount} actions`} />
                ) : null}
                {integration.tools.length > 0 ? (
                  <StatPill label={`${integration.tools.length} tools`} />
                ) : null}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {integration.name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
                {integration.description}
              </p>
            </div>
          </div>

          <div className="min-w-[240px] rounded-[24px] border border-white/10 bg-zinc-950/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Connection
            </p>
            <p className="mt-3 text-sm font-medium text-white">
              {statusLabel(integration)}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {integration.connection?.connectedAt
                ? `Connected ${new Date(integration.connection.connectedAt).toLocaleDateString()}`
                : integration.source === "mcp"
                  ? "Setup flow for MCP servers is next. This page already reflects the server metadata, tools, and config requirements."
                  : integration.authType === "oauth2"
                    ? "OAuth wiring is the next step. The catalog entry is ready for provider-specific connect flow."
                    : "This integration can be connected from the marketplace using credentials."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Section title={integration.source === "mcp" ? "Tools" : "Actions"}>
          {integration.source === "mcp" ? (
            integration.tools.length > 0 ? (
              <div className="grid gap-3">
                {integration.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-sm font-medium text-white">{tool.name}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-300">
                      {tool.description || "No description available."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-zinc-300">
                No tools have been discovered for this server in the current workspace yet.
              </p>
            )
          ) : integration.actions.length > 0 ? (
            <div className="grid gap-3">
              {integration.actions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">
                      {action.displayName}
                    </p>
                    {action.category ? (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                        {action.category}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-zinc-300">
                    {action.description || "No description available."}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-zinc-300">
              No actions are registered for this integration.
            </p>
          )}
        </Section>

        <Section title="Configuration">
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Auth model
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {authTypeLabel(integration.authType)}
              </p>
            </div>

            {integration.configFields.length > 0 ? (
              integration.configFields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">{field.label}</p>
                    {field.required ? (
                      <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-amber-200">
                        Required
                      </span>
                    ) : null}
                    {field.type ? (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                        {field.type}
                      </span>
                    ) : null}
                  </div>
                  {field.description ? (
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {field.description}
                    </p>
                  ) : null}
                  {field.placeholder ? (
                    <p className="mt-2 text-xs text-zinc-500">
                      Example: {field.placeholder}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-zinc-300">
                No structured config fields are published for this integration yet.
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
