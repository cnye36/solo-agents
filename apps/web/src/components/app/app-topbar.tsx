import { NavUser } from "@/components/app/nav-user";

type AppTopbarProps = {
  title: string;
  subtitle: string;
  userEmail?: string | null;
};

export function AppTopbar({ title, subtitle, userEmail }: AppTopbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] px-5 py-5 md:flex-row md:items-center md:justify-between lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Solo Agents
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-300">{subtitle}</p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center md:justify-end">
        <div className="hidden rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-200 lg:block">
          Private workspace
        </div>
        <div className="lg:hidden">
          <NavUser email={userEmail} menuPlacement="down" />
        </div>
      </div>
    </div>
  );
}
