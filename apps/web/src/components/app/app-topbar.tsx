import { signOut } from "@/features/auth/actions";

type AppTopbarProps = {
  title: string;
  subtitle: string;
};

export function AppTopbar({ title, subtitle }: AppTopbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] px-5 py-5 md:flex-row md:items-center md:justify-between lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Solo Agents
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          Private workspace
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
