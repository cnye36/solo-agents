type FeatureCardProps = {
  title: string;
  description: string;
  footer?: string;
  children?: React.ReactNode;
};

export function FeatureCard({
  title,
  description,
  footer,
  children,
}: FeatureCardProps) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-zinc-900/40 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm leading-6 text-zinc-300">{description}</p>
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
      {footer ? (
        <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">
          {footer}
        </p>
      ) : null}
    </section>
  );
}
