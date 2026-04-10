import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@solo-agents/config";
import { FeatureCard } from "@/components/ui/feature-card";

const marketingItems = [
  {
    title: "One assistant",
    description:
      "Every user gets one powerful assistant instead of a builder full of agents, flows, and setup decisions.",
  },
  {
    title: "Connected apps",
    description:
      "Bring in the tools you already use without exposing MCP or integration plumbing.",
  },
  {
    title: "Files and memory",
    description:
      "Upload reference material, keep preferences in sync, and let the assistant stay useful over time.",
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen px-5 py-8 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <header className="flex flex-col gap-8 rounded-[32px] border border-white/10 bg-[rgba(12,18,33,0.85)] p-8 shadow-[0_32px_120px_rgba(15,23,42,0.45)] backdrop-blur lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              {APP_NAME}
            </p>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950"
              >
                Start free
              </Link>
            </div>
          </div>

          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl font-semibold tracking-tight text-white lg:text-6xl">
              A simpler assistant experience built on proven infrastructure.
            </h1>
            <p className="text-lg leading-8 text-slate-300">{APP_TAGLINE}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950"
              >
                Create account
              </Link>
              <Link
                href="/chat"
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-slate-100"
              >
                View app shell
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {marketingItems.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
