import type { ConnectedApp } from "@solo-agents/types";
import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

type IntegrationsOverviewProps = {
  apps: ConnectedApp[];
};

export function IntegrationsOverview({ apps }: IntegrationsOverviewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Connected Apps"
        title="Connect the tools your assistant can use"
        description="This screen hides MCP and tool-assignment jargon behind a simple app-connection experience."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {apps.map((app) => (
          <FeatureCard
            key={app.id}
            title={app.name}
            description={app.summary}
            footer="Implementation TODO: map this card to the existing integrations catalog and OAuth connection flow."
          >
            <div className="flex items-center justify-between gap-4">
              <StatusBadge
                label={app.status}
                tone={app.status === "connected" ? "success" : "default"}
              />
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-100">
                {app.status === "connected" ? "Manage" : "Connect"}
              </button>
            </div>
          </FeatureCard>
        ))}
      </div>
    </div>
  );
}
