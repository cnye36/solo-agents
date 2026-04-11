import Link from "next/link";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@solo-agents/config";

const productPillars = [
  {
    title: "One assistant, not a maze",
    description:
      "A focused workspace for one high-context assistant instead of a builder full of agent setup screens and orchestration concepts.",
  },
  {
    title: "Connected to your real tools",
    description:
      "Bring in existing apps, uploaded files, and preference data without exposing integration mechanics to end users.",
  },
  {
    title: "Built on proven runtime infrastructure",
    description:
      "The experience stays thin and intentional while the existing AffinityBots, Supabase, and LangGraph layers do the heavy lifting.",
  },
];

const launchPoints = [
  "Draft launch updates, summaries, and briefs",
  "Pull context from connected apps and uploaded files",
  "Keep conversation history, preferences, and memory in one place",
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden px-5 py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-[8rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[20%] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/20 px-5 py-3 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              {APP_NAME}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.92),rgba(9,13,26,0.88))] p-8 shadow-[0_32px_120px_rgba(3,8,20,0.45)] lg:p-12">
            <div className="absolute right-0 top-0 h-56 w-56 translate-x-1/4 -translate-y-1/4 rounded-full bg-white/8 blur-3xl" />
            <div className="relative max-w-4xl space-y-8">
              <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
                Chat-first assistant workspace
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  A sharper home for your assistant, your context, and your next move.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  {APP_TAGLINE}
                </p>
                <p className="max-w-2xl text-sm leading-7 text-slate-400">
                  {APP_DESCRIPTION}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/5"
                >
                  Sign in to continue
                </Link>
              </div>

              <div className="grid gap-4 pt-2 sm:grid-cols-3">
                {productPillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <p className="text-base font-semibold text-white">
                      {pillar.title}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[36px] border border-white/10 bg-[rgba(11,17,30,0.88)] p-6 shadow-[0_24px_80px_rgba(7,10,20,0.35)] backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Inside the app
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    A single place to work with your assistant
                  </h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  Ready for live wiring
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Northstar Assistant
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Conversation workspace
                    </p>
                  </div>
                  <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-white">
                    Streaming
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                    Summarize this week&apos;s customer calls and list the top three product risks.
                  </div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
                    I can turn that into an executive summary, identify repeated objections, and suggest the most urgent next actions.
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[36px] border border-white/10 bg-black/20 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                What it should feel like
              </p>
              <ul className="mt-5 space-y-3">
                {launchPoints.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
