"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { ThreadSummary } from "@solo-agents/types";
import { formatThreadDayLabel } from "@/features/chat/chat-format";
import { PlusIcon, SearchIcon } from "@/features/chat/chat-icons";

type ThreadSidebarProps = {
  activeThreadId: string | null;
  threads: ThreadSummary[];
  onNewThread: () => void;
  onSelectThread: (thread: ThreadSummary) => void;
};

export function ThreadSidebar({
  activeThreadId,
  threads,
  onNewThread,
  onSelectThread,
}: ThreadSidebarProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredThreads = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    if (!normalized) {
      return threads;
    }

    return threads.filter((thread) => {
      const haystack = `${thread.title} ${thread.preview}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [deferredQuery, threads]);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900/40 p-3 shadow-[0_20px_64px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex shrink-0 items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/50 px-3 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="w-full min-w-0 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        </label>

        <button
          type="button"
          onClick={onNewThread}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          aria-label="New thread"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          {filteredThreads.length ? (
            filteredThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => onSelectThread(thread)}
                  className={
                    isActive
                      ? "w-full rounded-2xl border border-zinc-500/35 bg-zinc-800/55 px-4 py-3 text-left shadow-[0_12px_28px_rgba(0,0,0,0.14)] ring-1 ring-inset ring-white/5"
                      : "w-full rounded-2xl border border-white/8 bg-zinc-950/30 px-4 py-3 text-left transition hover:border-white/14 hover:bg-zinc-800/35"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {thread.title || "Untitled thread"}
                    </p>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                      {formatThreadDayLabel(thread.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                    {thread.preview || " "}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/40 px-4 py-6 text-sm leading-6 text-zinc-400">
              {threads.length
                ? "No matching threads."
                : "No threads yet."}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
