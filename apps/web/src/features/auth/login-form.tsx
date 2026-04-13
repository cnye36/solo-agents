"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FeatureCard } from "@/components/ui/feature-card";
import { signIn } from "@/features/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-zinc-950 disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Signing in…" : "Continue"}
    </button>
  );
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(formData: FormData) {
    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setError(null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <FeatureCard
        title="Sign in"
        description="Uses Supabase Auth (email/password) with SSR cookies."
        footer="Sessions are stored in HTTP-only cookies via @supabase/ssr."
      >
        <form action={handleSignIn} className="space-y-4">
          {error ? (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-white outline-none"
            placeholder="Email"
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-white outline-none"
            placeholder="Password"
          />
          <SubmitButton />
        </form>
        <p className="mt-4 text-sm text-zinc-300">
          New here?{" "}
          <Link className="text-white underline" href="/signup">
            Create an account
          </Link>
        </p>
      </FeatureCard>
    </div>
  );
}
