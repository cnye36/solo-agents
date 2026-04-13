import { FeatureCard } from "@/components/ui/feature-card";

type BootstrapSummaryProps = {
  todos: string[];
};

export function BootstrapSummary({ todos }: BootstrapSummaryProps) {
  return (
    <FeatureCard
      title="Backend integration checklist"
      description="These placeholders are intentionally scaffolded around the existing AffinityBots backend so the next step is contract mapping, not a runtime rewrite."
    >
      <ul className="space-y-3 text-sm leading-6 text-zinc-300">
        {todos.map((todo) => (
          <li
            key={todo}
            className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3"
          >
            {todo}
          </li>
        ))}
      </ul>
    </FeatureCard>
  );
}
