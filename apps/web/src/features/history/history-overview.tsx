import type { ThreadSummary } from "@solo-agents/types";
import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";

type HistoryOverviewProps = {
  threads: ThreadSummary[];
};

export function HistoryOverview({ threads }: HistoryOverviewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Conversation history"
        description="Users should be able to find prior conversations quickly without turning history into the primary navigation model."
      />

      <FeatureCard
        title="Recent threads"
        description="This will map to the assistant-scoped thread list in the existing platform."
        footer="Implementation TODO: connect to /api/agents/[agentId]/threads and support search, pagination, and archive/delete actions."
      >
        <div className="space-y-3">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-white">{thread.title}</p>
                <span className="text-xs text-[var(--muted)]">
                  {thread.updatedAt}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {thread.preview}
              </p>
            </div>
          ))}
        </div>
      </FeatureCard>
    </div>
  );
}
