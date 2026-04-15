"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";

type NavUserProps = {
  email?: string | null;
  /** Sidebar uses upward menu; top bar should open downward. */
  menuPlacement?: "up" | "down";
};

export function NavUser({ email, menuPlacement = "up" }: NavUserProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const accountOrPrefsActive =
    pathname.startsWith("/account") || pathname.startsWith("/preferences");

  const displayLabel =
    email && email.length > 0 ? email : "Signed in";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
          open || accountOrPrefsActive
            ? "bg-zinc-800/85 text-zinc-50 ring-1 ring-inset ring-white/10"
            : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-zinc-100">
            {displayLabel}
          </span>
          <span className="block text-xs text-zinc-500">Account & settings</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={cn(
            "h-4 w-4 shrink-0 text-zinc-500 transition",
            menuPlacement === "down"
              ? open
                ? "rotate-0"
                : "rotate-180"
              : open
                ? "rotate-180"
                : "rotate-0",
          )}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute left-0 right-0 z-50 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 py-1 shadow-lg shadow-black/40 backdrop-blur-md",
            menuPlacement === "up" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          <Link
            href="/account"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-zinc-800/80 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/preferences"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-zinc-800/80 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Preferences
          </Link>
          <div className="my-1 border-t border-white/10" />
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-zinc-800/80 hover:text-white"
            >
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
