import Link from "next/link";
import { APP_NAME } from "@solo-agents/config";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconWorkspace() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconContext() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M12 3c-1.2 5.4-3 7.2-8.4 8.4C9 12.6 10.8 14.4 12 21c1.2-6.6 3-8.4 8.4-9.6C14.8 10.2 13.2 8.4 12 3z" strokeLinejoin="round" />
    </svg>
  );
}

function IconIntegrations() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M13.5 6H5a2 2 0 00-2 2v10a2 2 0 002 2h12.5" strokeLinecap="round" />
      <path d="M16 2l4 4-4 4M20 6h-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMemory() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStream() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M13 3L4 14h8l-1 7 9-11h-8l1-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSecurity() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M12 2l7 3v5c0 5-3.1 8.7-7 10-3.9-1.3-7-5-7-10V5l7-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 translate-x-0.5">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <IconWorkspace />,
    title: "Unified Workspace",
    description: "One focused interface for all your AI interactions. No tab-switching, no scattered tools — everything in arm's reach.",
    accentClass: "text-[var(--accent)] bg-[var(--accent-soft)]",
  },
  {
    icon: <IconContext />,
    title: "Deep Context Awareness",
    description: "Your assistant knows your files, history, and preferences. Every response is grounded in what actually matters to you.",
    accentClass: "text-[var(--accent-violet)] bg-[var(--accent-violet-soft)]",
  },
  {
    icon: <IconIntegrations />,
    title: "Native Integrations",
    description: "Connect the tools you already use. Pull in context from your apps without exposing any integration complexity to your workflow.",
    accentClass: "text-[var(--accent)] bg-[var(--accent-soft)]",
  },
  {
    icon: <IconMemory />,
    title: "Persistent Memory",
    description: "Conversations that build on each other. History and preferences carry forward so you never have to repeat yourself.",
    accentClass: "text-[var(--accent-violet)] bg-[var(--accent-violet-soft)]",
  },
  {
    icon: <IconStream />,
    title: "Real-time Streaming",
    description: "Responses appear the instant they're generated. Zero latency between thought and answer — the way AI should feel.",
    accentClass: "text-[var(--accent)] bg-[var(--accent-soft)]",
  },
  {
    icon: <IconSecurity />,
    title: "Secure by Default",
    description: "Enterprise-grade auth, encrypted storage, and a strict secret boundary between browser-safe keys and privileged access.",
    accentClass: "text-[var(--accent-violet)] bg-[var(--accent-violet-soft)]",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect your tools",
    description: "Link the apps you already rely on and upload your key files. Give your assistant full context on day one.",
  },
  {
    number: "02",
    title: "Start the conversation",
    description: "Ask anything. Your assistant draws from connected sources to give grounded, specific, and useful answers.",
  },
  {
    number: "03",
    title: "Build on every session",
    description: "History, preferences, and memory persist across sessions. Every conversation picks up right where you left off.",
  },
];

const trustNames = [
  "Acme Corp",
  "Lumen Labs",
  "Meridian AI",
  "Orbit Systems",
  "Vantage HQ",
  "Pulse Ventures",
  "Acme Corp",
  "Lumen Labs",
  "Meridian AI",
  "Orbit Systems",
  "Vantage HQ",
  "Pulse Ventures",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">

      {/* ── Fixed background orbs ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-float absolute -left-48 -top-48 h-[680px] w-[680px] rounded-full bg-zinc-500/[0.06] blur-[140px]" />
        <div className="animate-float-slow absolute -right-48 top-1/4 h-[560px] w-[560px] rounded-full bg-violet-500/[0.07] blur-[120px]" />
        <div className="animate-float-reverse absolute bottom-0 left-1/3 h-[480px] w-[640px] rounded-full bg-zinc-400/[0.05] blur-[110px]" />
      </div>

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-[0_0_14px_rgba(167,139,250,0.35)]">
              <IconStar />
            </div>
            <span className="text-sm font-semibold text-white">{APP_NAME}</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { href: "#features", label: "Features" },
              { href: "#demo", label: "Demo" },
              { href: "#how-it-works", label: "How it works" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--muted)] transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-[var(--muted)] transition hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(167,139,250,0.35)] transition hover:shadow-[0_0_26px_rgba(167,139,250,0.5)] hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-4 py-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
          <span className="text-xs font-medium tracking-wide text-violet-200">
            Now in early access
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[1.08] tracking-tight text-white">
          Your AI assistant,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #fafafa 0%, #d4d4d8 35%, #a78bfa 70%, #c4b5fd 100%)",
            }}
          >
            fully in context.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-7 max-w-2xl text-xl leading-8 text-zinc-400">
          One premium workspace where your AI assistant has access to your
          tools, files, and history — so it actually helps you get work done.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(167,139,250,0.38)] transition hover:shadow-[0_0_42px_rgba(167,139,250,0.55)] hover:opacity-90 active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
            }}
          >
            Start for free
          </Link>
          <a
            href="#demo"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-8 py-3.5 text-sm font-medium text-white backdrop-blur transition hover:border-white/30 hover:bg-white/[0.1]"
          >
            Watch the demo
            <span className="transition group-hover:translate-y-0.5">↓</span>
          </a>
        </div>

        {/* Product mockup */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-zinc-950/95 shadow-[0_48px_120px_rgba(0,0,0,0.65)] backdrop-blur">
            {/* Glow behind mockup */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/35 to-transparent" />

            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3.5">
              <span className="h-3 w-3 rounded-full bg-red-400/50" />
              <span className="h-3 w-3 rounded-full bg-amber-400/50" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/50" />
              <span className="ml-3 text-xs text-zinc-500">
                {APP_NAME} — Chat workspace
              </span>
            </div>

            {/* App chrome */}
            <div className="flex" style={{ height: "420px" }}>
              {/* Sidebar */}
              <div className="hidden w-56 shrink-0 flex-col gap-1 border-r border-white/[0.06] p-3 md:flex">
                <p className="mb-2 px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  Threads
                </p>
                {[
                  { label: "Q3 strategy update", active: true },
                  { label: "Product risk review", active: false },
                  { label: "Onboarding scripts", active: false },
                  { label: "Tech stack review", active: false },
                ].map((thread) => (
                  <div
                    key={thread.label}
                    className={`rounded-lg px-3 py-2.5 text-left text-xs ${
                      thread.active
                        ? "bg-[var(--accent-soft)] text-violet-100"
                        : "text-zinc-500 hover:bg-white/5"
                    }`}
                  >
                    {thread.label}
                  </div>
                ))}
              </div>

              {/* Chat area */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Thread header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                  <p className="text-sm font-medium text-white">
                    Q3 strategy update
                  </p>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                    Live
                  </span>
                </div>

                {/* Messages */}
                <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden px-5 py-4">
                  <div className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-md border border-white/10 bg-white/8 px-4 py-3 text-sm text-zinc-200">
                      Summarize this week&apos;s customer calls and flag the top product risks.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[78%] space-y-2 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-zinc-100">
                      <p>Here&apos;s a summary across 14 calls this week:</p>
                      <ul className="space-y-1 pl-4 text-zinc-300">
                        <li className="list-disc">Onboarding friction cited by 6 accounts</li>
                        <li className="list-disc">API reliability questions from 4 enterprise leads</li>
                        <li className="list-disc">Pricing clarity flagged as a blocker in 3 deals</li>
                      </ul>
                      <p className="text-xs text-zinc-500">Sources: Gong, Notion, uploaded call transcripts</p>
                    </div>
                  </div>
                </div>

                {/* Composer */}
                <div className="border-t border-white/[0.06] p-4">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <span className="flex-1 text-sm text-zinc-600">
                      Ask anything…
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-violet-300">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection */}
          <div
            className="pointer-events-none mx-4 h-16 rounded-b-2xl blur-sm"
            style={{
              background:
                "linear-gradient(180deg, rgba(24,24,27,0.45) 0%, transparent 100%)",
            }}
          />
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="overflow-hidden border-y border-white/[0.05] py-10">
        <p className="mb-7 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-600">
          Trusted by teams at
        </p>
        <div className="relative flex">
          <div className="animate-marquee flex shrink-0 items-center gap-16 pr-16">
            {trustNames.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap text-sm font-semibold text-zinc-600 transition hover:text-zinc-400"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Features
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Everything your assistant needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-zinc-400">
              Built around how AI assistants actually work — and how people
              actually use them.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/[0.08] bg-[var(--surface)] p-6 backdrop-blur transition hover:border-white/[0.14] hover:bg-white/[0.04]"
              >
                <div
                  className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.accentClass}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video demo ── */}
      <section id="demo" className="py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Demo
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              See it in action
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-400">
              Watch how a full context-aware AI session actually works from start to finish.
            </p>
          </div>

          <div className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border border-white/[0.09] shadow-[0_48px_100px_rgba(0,0,0,0.55)]">
            {/* Gradient background placeholder */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #18181b 0%, #27272a 45%, #09090b 100%)",
              }}
            />

            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(113,113,122,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(113,113,122,0.9) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            {/* Glow behind play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full bg-violet-500/12 blur-3xl" />
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_0_40px_rgba(167,139,250,0.22)] backdrop-blur transition duration-200 group-hover:scale-105 group-hover:bg-white/18 group-hover:shadow-[0_0_60px_rgba(167,139,250,0.32)]">
                <IconPlay />
              </div>
            </div>

            {/* Top glow line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/35 to-transparent" />

            {/* Label */}
            <div className="absolute bottom-6 left-6">
              <p className="text-sm font-semibold text-white">
                Product walkthrough
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">3-min overview · Coming soon</p>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-6 right-6 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-xs font-medium text-zinc-400 backdrop-blur">
              3:24
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              How it works
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="absolute left-full top-6 hidden h-px w-full -translate-x-4 bg-gradient-to-r from-white/10 to-transparent md:block" />
                )}

                <div
                  className="mb-4 inline-block text-6xl font-bold tracking-tight"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(212,212,216,0.85), rgba(167,139,250,0.45))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 p-16 text-center">
            {/* Background gradient */}
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.1) 0%, transparent 70%), radial-gradient(ellipse at 50% 100%, rgba(161,161,170,0.06) 0%, transparent 70%), rgba(24,24,27,0.85)",
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/35 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Get early access
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-zinc-400">
              Join early access and experience a sharper way to work with AI —
              one that actually knows your context.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(167,139,250,0.38)] transition hover:shadow-[0_0_42px_rgba(167,139,250,0.55)] hover:opacity-90 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                }}
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 bg-white/[0.06] px-8 py-3.5 text-sm font-medium text-white backdrop-blur transition hover:border-white/30 hover:bg-white/[0.1]"
              >
                Sign in to continue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-violet-700 text-white">
              <IconStar />
            </div>
            <span className="text-sm font-semibold text-white">{APP_NAME}</span>
          </div>

          <p className="text-xs text-[var(--muted)]">
            © 2025 {APP_NAME}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {[
              { href: "#", label: "Privacy" },
              { href: "#", label: "Terms" },
              { href: "/login", label: "Sign in" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-[var(--muted)] transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
