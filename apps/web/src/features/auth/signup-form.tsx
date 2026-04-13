"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FeatureCard } from "@/components/ui/feature-card";
import { signUp } from "@/features/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-full bg-white px-4 py-3 text-sm font-medium text-zinc-950 disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSignUp(formData: FormData) {
    const result = await signUp(formData);

    if (result?.error) {
      setError(result.error);
      setInfo(null);
      return;
    }

    setError(null);
    setInfo(result?.info ?? null);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <FeatureCard
        title="Create your account"
        description="Creates a Supabase user; you may need to confirm email if that is enabled in the project."
        footer="After signup you will be sent to onboarding when a session exists."
      >
        <form action={handleSignUp} className="space-y-4">
          {error ? (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {info}
            </p>
          ) : null}
          <input
            name="fullName"
            autoComplete="name"
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-white outline-none"
            placeholder="Full name (optional)"
          />
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
            autoComplete="new-password"
            required
            minLength={6}
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-white outline-none"
            placeholder="Password"
          />
          <SubmitButton />
        </form>
        <p className="mt-4 text-sm text-zinc-300">
          Already have an account?{" "}
          <Link className="text-white underline" href="/login">
            Sign in
          </Link>
        </p>
      </FeatureCard>
    </div>
  );
}
