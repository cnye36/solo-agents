import Link from "next/link";
import { FeatureCard } from "@/components/ui/feature-card";
import { signUp } from "@/features/auth/actions";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <FeatureCard
        title="Create your account"
        description="A lightweight signup flow should move users quickly into onboarding and assistant provisioning."
        footer="Implementation TODO: connect to the existing auth provider and add optional billing or invite-aware signup paths later."
      >
        <form action={signUp} className="space-y-4">
          <input
            name="fullName"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            placeholder="Full name"
          />
          <input
            name="email"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            placeholder="Email"
          />
          <input
            name="password"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            placeholder="Password"
            type="password"
          />
          <button className="w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-950">
            Create account
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{" "}
          <Link className="text-white underline" href="/login">
            Sign in
          </Link>
        </p>
      </FeatureCard>
    </div>
  );
}
