import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";

type AccountOverviewProps = {
  email: string;
  planName: string;
  renewalLabel: string;
};

export function AccountOverview({
  email,
  planName,
  renewalLabel,
}: AccountOverviewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Account and billing"
        description="This route provides a clean home for profile details, subscription summary, and billing actions."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <FeatureCard
          title="Profile"
          description="Basic account details should be easy to find and edit."
        >
          <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/50 p-4 text-sm text-zinc-200">
            <p>
              <span className="text-[var(--muted)]">Email:</span> {email}
            </p>
            <p>
              <span className="text-[var(--muted)]">Assistant access:</span>{" "}
              Active
            </p>
          </div>
        </FeatureCard>

        <FeatureCard
          title="Billing"
          description="Initial billing can be a simple summary plus a portal handoff."
          footer="Implementation TODO: connect this to the existing subscription and Stripe portal endpoints."
        >
          <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
            <p className="text-sm text-[var(--muted)]">Current plan</p>
            <p className="text-xl font-semibold text-white">{planName}</p>
            <p className="text-sm text-zinc-300">{renewalLabel}</p>
            <button className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">
              Open billing portal
            </button>
          </div>
        </FeatureCard>
      </div>
    </div>
  );
}
