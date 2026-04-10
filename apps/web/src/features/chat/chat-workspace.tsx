import type { AssistantSummary, ThreadSummary } from "@solo-agents/types";
import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

type ChatWorkspaceProps = {
  assistant: AssistantSummary;
  recentThreads: ThreadSummary[];
};

const suggestedPrompts = [
  "Summarize what changed since my last update.",
  "Turn my rough notes into a polished brief.",
  "Find the blockers and recommend next steps.",
];

export function ChatWorkspace({
  assistant,
  recentThreads,
}: ChatWorkspaceProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Chat"
        title={`Talk to ${assistant.name}`}
        description="This route will become the primary streaming conversation UI. It is intentionally centered on one assistant, with no workflow or builder concepts exposed."
        action={
          <StatusBadge
            label={
              assistant.status === "ready" ? "Assistant ready" : "Provisioning"
            }
            tone={assistant.status === "ready" ? "success" : "warning"}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <FeatureCard
          title="Conversation"
          description="A polished streaming chat experience will live here, backed by the existing AffinityBots thread and LangGraph runtime."
          footer="Implementation TODO: create or resume a single assistant thread and stream responses through the existing /api/chat proxy."
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
              <p className="font-medium text-white">You</p>
              <p className="mt-2">
                Help me turn this week&apos;s notes into a concise launch update.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--accent-soft)] bg-[var(--accent-soft)] p-4 text-sm leading-6 text-slate-100">
              <p className="font-medium text-white">{assistant.name}</p>
              <p className="mt-2">
                I can help with that. Once the runtime is wired up, I&apos;ll use
                your connected apps, uploaded files, and memory to draft a clean
                summary.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <label className="block text-sm font-medium text-white">
                Message
              </label>
              <textarea
                disabled
                className="mt-3 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200 outline-none"
                defaultValue="This disabled composer is a placeholder for the streaming chat input."
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950">
                  Send
                </button>
                <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200">
                  Attach file
                </button>
              </div>
            </div>
          </div>
        </FeatureCard>

        <div className="space-y-6">
          <FeatureCard
            title="Quick starts"
            description="The first-run experience should make it obvious what the assistant can help with."
          >
            <div className="space-y-3">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-slate-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            title="Recent conversations"
            description="Conversation history remains visible, but secondary to the main chat view."
          >
            <div className="space-y-3">
              {recentThreads.map((thread) => (
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
      </div>
    </div>
  );
}
