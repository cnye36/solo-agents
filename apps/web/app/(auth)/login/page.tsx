import Link from "next/link";
import { FeatureCard } from "@/components/ui/feature-card";
import { signIn } from "@/features/auth/actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <FeatureCard
        title="Sign in"
        description="This screen will connect to the existing AffinityBots Supabase auth flow, but keep the experience product-specific."
        footer="Implementation TODO: replace this form with Supabase SSR auth actions and redirect into bootstrap/onboarding."
      >
        <form action={signIn} className="space-y-4">
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
            Continue
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          New here?{" "}
          <Link className="text-white underline" href="/signup">
            Create an account
          </Link>
        </p>
      </FeatureCard>
    </div>
  );
}
