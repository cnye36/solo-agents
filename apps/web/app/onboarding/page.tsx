import Link from "next/link";
import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          eyebrow="Onboarding"
          title="Set up your assistant"
          description="This should stay short: a bit of context, a few preferences, and then users should land directly in chat."
        />

        <FeatureCard
          title="First-time setup"
          description="Collect just enough detail to personalize the assistant without making users design a system."
          footer="Implementation TODO: submit this to a bootstrap/provisioning flow that creates or associates one assistant per user."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-white outline-none"
              placeholder="What do you want help with most?"
            />
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-white outline-none"
              placeholder="Preferred tone"
            />
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-white outline-none md:col-span-2"
              placeholder="Optional: connected app or first file to add"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950">
              Finish setup
            </button>
            <Link
              href="/chat"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-zinc-100"
            >
              Skip for now
            </Link>
          </div>
        </FeatureCard>
      </div>
    </div>
  );
}
