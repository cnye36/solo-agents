import { cn } from "@/lib/utils/cn";

type StatusBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning";
};

export function StatusBadge({
  label,
  tone = "default",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "success" &&
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
        tone === "warning" &&
          "border-amber-400/30 bg-amber-400/10 text-amber-100",
        tone === "default" &&
          "border-white/10 bg-zinc-900/45 text-zinc-200",
      )}
    >
      {label}
    </span>
  );
}
