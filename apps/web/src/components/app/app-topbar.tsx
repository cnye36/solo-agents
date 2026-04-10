type AppTopbarProps = {
  title: string;
  subtitle: string;
};

export function AppTopbar({ title, subtitle }: AppTopbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] px-5 py-5 md:flex-row md:items-center md:justify-between lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        Assistant ready
      </div>
    </div>
  );
}
