"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@solo-agents/config";
import { NavUser } from "@/components/app/nav-user";
import { cn } from "@/lib/utils/cn";

type AppSidebarProps = {
  userEmail?: string | null;
};

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-[var(--border)] bg-zinc-950/85 backdrop-blur-md px-5 py-6 lg:flex lg:flex-col">
      <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-5">
        
        <h1 className="text-xl font-semibold text-white">
          Solo Assistant
        </h1>
        
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
                  ? "bg-zinc-800/85 text-zinc-50 ring-1 ring-inset ring-white/10"
                  : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4 pt-6">
        <NavUser email={userEmail} />
        
      </div>
    </aside>
  );
}
