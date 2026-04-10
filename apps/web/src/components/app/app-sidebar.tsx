"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@solo-agents/config";
import { cn } from "@/lib/utils/cn";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-[var(--border)] bg-[rgba(7,12,24,0.78)] px-5 py-6 lg:flex lg:flex-col">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Assistant
        </p>
        <h1 className="mt-3 text-xl font-semibold text-white">
          Northstar Assistant
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          A simpler assistant layer on top of the existing platform runtime.
        </p>
      </div>

      <nav className="mt-8 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-2xl px-4 py-3 text-sm transition",
                isActive
                  ? "bg-[var(--accent-soft)] text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-medium text-white">Starter plan</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Billing and feature access will connect to the existing subscription
          surfaces next.
        </p>
      </div>
    </aside>
  );
}
