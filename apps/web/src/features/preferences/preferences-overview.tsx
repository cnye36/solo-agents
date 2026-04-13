import type { PreferenceGroup } from "@solo-agents/types";
import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";

type PreferencesOverviewProps = {
  groups: PreferenceGroup[];
};

export function PreferencesOverview({
  groups,
}: PreferencesOverviewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="How your assistant should work"
        description="Settings stay human-friendly: tone, behavior, memory, and defaults, without exposing backend agent-builder concepts."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <FeatureCard
            key={group.title}
            title={group.title}
            description={group.description}
            footer="Implementation TODO: map these sections to assistant configuration and user preference APIs."
          >
            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3"
                >
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <p className="mt-1 font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </FeatureCard>
        ))}
      </div>
    </div>
  );
}
