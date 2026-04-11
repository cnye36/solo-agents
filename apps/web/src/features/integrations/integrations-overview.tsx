"use client";

import Link from "next/link";
import {
  useDeferredValue,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import type {
  IntegrationAuthType,
  IntegrationCatalogItem,
} from "@solo-agents/types";
import { CloseIcon } from "@/features/chat/chat-icons";

type IntegrationsOverviewProps = {
  apps: IntegrationCatalogItem[];
};

type CredentialFormState = {
  apiKey: string;
  accessToken: string;
  basicAuthUsername: string;
  basicAuthPassword: string;
};

const initialCredentialState: CredentialFormState = {
  apiKey: "",
  accessToken: "",
  basicAuthUsername: "",
  basicAuthPassword: "",
};

const ITEMS_PER_PAGE = 36;

function authTypeLabel(authType: IntegrationAuthType) {
  switch (authType) {
    case "oauth2":
      return "OAuth";
    case "api_key":
      return "API Key";
    case "bearer":
      return "Bearer";
    case "basic":
      return "Basic";
    default:
      return "No Auth";
  }
}

function sourceLabel(source: IntegrationCatalogItem["source"]) {
  return source === "mcp" ? "MCP" : "API";
}

function integrationHref(app: IntegrationCatalogItem) {
  return `/integrations/${encodeURIComponent(app.id)}`;
}

function statusLabel(app: IntegrationCatalogItem) {
  if (!app.connection) {
    return "Available";
  }

  if (app.connection.status === "needs_reauth") {
    return "Reconnect";
  }

  return "Connected";
}

function StatusPill({ app }: { app: IntegrationCatalogItem }) {
  const label = statusLabel(app);
  const classes =
    app.connection?.status === "connected"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
      : app.connection?.status === "needs_reauth"
        ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
        : "border-white/10 bg-white/[0.04] text-slate-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${classes}`}
    >
      {label}
    </span>
  );
}

function IntegrationLogo({ app }: { app: IntegrationCatalogItem }) {
  if (app.iconUrl) {
    return (
      <img
        src={app.iconUrl}
        alt=""
        className="h-11 w-11 rounded-2xl border border-white/10 bg-white p-2 object-contain shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
      {app.name.slice(0, 2)}
    </div>
  );
}

function AuthFields({
  authType,
  formState,
  onChange,
}: {
  authType: IntegrationAuthType;
  formState: CredentialFormState;
  onChange: (field: keyof CredentialFormState, value: string) => void;
}) {
  if (authType === "api_key") {
    return (
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">API key</span>
        <input
          type="password"
          value={formState.apiKey}
          onChange={(event) => onChange("apiKey", event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          placeholder="Paste the API key"
        />
      </label>
    );
  }

  if (authType === "bearer") {
    return (
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Access token</span>
        <input
          type="password"
          value={formState.accessToken}
          onChange={(event) => onChange("accessToken", event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          placeholder="Paste the bearer token"
        />
      </label>
    );
  }

  if (authType === "basic") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Username</span>
          <input
            type="text"
            value={formState.basicAuthUsername}
            onChange={(event) =>
              onChange("basicAuthUsername", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Username"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Password</span>
          <input
            type="password"
            value={formState.basicAuthPassword}
            onChange={(event) =>
              onChange("basicAuthPassword", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Password"
          />
        </label>
      </div>
    );
  }

  if (authType === "none") {
    return (
      <p className="text-sm leading-6 text-slate-300">
        This integration does not require credentials. Save to enable it for
        your workspace.
      </p>
    );
  }

  return (
    <p className="text-sm leading-6 text-slate-300">
      OAuth-based connections are the next step in Solo Agents. The catalog and
      connection state are now wired; provider redirects and callbacks come
      next.
    </p>
  );
}

export function IntegrationsOverview({
  apps: initialApps,
}: IntegrationsOverviewProps) {
  const router = useRouter();
  const [apps, setApps] = useState(initialApps);
  const [query, setQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<IntegrationCatalogItem | null>(
    null,
  );
  const [formState, setFormState] = useState(initialCredentialState);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const filteredApps = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    if (!normalized) {
      return apps;
    }

    return apps.filter((app) =>
      `${app.name} ${app.description} ${app.slug}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [apps, deferredQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedApps = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredApps.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApps, safeCurrentPage]);

  async function refreshCatalog() {
    const response = await fetch("/api/integrations/catalog", {
      cache: "no-store",
    });
    const data = (await response.json()) as { apps?: IntegrationCatalogItem[] };

    if (!response.ok) {
      throw new Error("Failed to refresh integrations.");
    }

    setApps(data.apps ?? []);
    router.refresh();
  }

  function openConnectionModal(app: IntegrationCatalogItem) {
    setSelectedApp(app);
    setFormState(initialCredentialState);
    setError(null);
  }

  function closeConnectionModal() {
    setSelectedApp(null);
    setFormState(initialCredentialState);
    setError(null);
  }

  function handleFieldChange(
    field: keyof CredentialFormState,
    value: string,
  ) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleDisconnect(app: IntegrationCatalogItem) {
    startTransition(async () => {
      setError(null);

      const response = await fetch(
        `/api/integrations/connect?integrationId=${encodeURIComponent(app.id)}`,
        {
          method: "DELETE",
        },
      );

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to disconnect integration.");
        return;
      }

      await refreshCatalog();
    });
  }

  function handleConnectSubmit() {
    if (!selectedApp) {
      return;
    }

    startTransition(async () => {
      setError(null);

      const response = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationId: selectedApp.id,
          apiKey: formState.apiKey,
          accessToken: formState.accessToken,
          basicAuthUsername: formState.basicAuthUsername,
          basicAuthPassword: formState.basicAuthPassword,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to save integration credentials.");
        return;
      }

      await refreshCatalog();
      closeConnectionModal();
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search apps"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>

      {error ? (
        <div className="shrink-0 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginatedApps.map((app) => (
            <div
              key={app.id}
              className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-4">
                  <IntegrationLogo app={app} />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-medium text-white">
                      {app.name}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
                      {app.description}
                    </p>
                  </div>
                </div>
                <StatusPill app={app} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  {sourceLabel(app.source)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  {authTypeLabel(app.authType)}
                </span>
                {app.actionCount > 0 ? (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {app.actionCount} actions
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex items-center gap-3">
                {app.source === "mcp" ? (
                  <Link
                    href={integrationHref(app)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                  >
                    View setup
                  </Link>
                ) : app.authType === "oauth2" ? (
                  <Link
                    href={integrationHref(app)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                  >
                    Open
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openConnectionModal(app)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                  >
                    {app.connection ? "Manage" : "Connect"}
                  </button>
                )}

                <Link
                  href={integrationHref(app)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.04]"
                >
                  Details
                </Link>

                {app.connection ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(app)}
                    disabled={isPending || app.source === "mcp"}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.04] disabled:opacity-60"
                  >
                    Disconnect
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="text-sm text-slate-300">
          Showing {paginatedApps.length ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
          {" "}-{" "}
          {(safeCurrentPage - 1) * ITEMS_PER_PAGE + paginatedApps.length} of{" "}
          {filteredApps.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safeCurrentPage === 1}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
            Page {safeCurrentPage} / {totalPages}
          </div>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={safeCurrentPage === totalPages}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {selectedApp ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[var(--background-soft)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {authTypeLabel(selectedApp.authType)}
                </p>
                <h2 className="mt-2 text-2xl font-medium text-white">
                  {selectedApp.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeConnectionModal}
                className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <AuthFields
                authType={selectedApp.authType}
                formState={formState}
                onChange={handleFieldChange}
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConnectSubmit}
                disabled={isPending || selectedApp.authType === "oauth2"}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-slate-500"
              >
                {selectedApp.connection ? "Save changes" : "Connect"}
              </button>
              <button
                type="button"
                onClick={closeConnectionModal}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
