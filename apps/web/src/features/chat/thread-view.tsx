"use client";

import { useEffect, useRef } from "react";
import type { ThreadSummary } from "@solo-agents/types";
import { SparkIcon } from "@/features/chat/chat-icons";
import { Message } from "@/features/chat/message";
import type { ChatMessage } from "@/features/chat/chat-types";

type ThreadViewProps = {
  assistantName: string;
  activeThread: ThreadSummary | null;
  messages: ChatMessage[];
  suggestedPrompts: string[];
  onPromptSelect: (prompt: string) => void;
};

export function ThreadView({
  assistantName,
  activeThread,
  messages,
  suggestedPrompts,
  onPromptSelect,
}: ThreadViewProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollTop = scroller.scrollHeight;
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_20px_64px_rgba(0,0,0,0.22)] backdrop-blur">
      {activeThread ? (
        <div className="shrink-0 border-b border-white/8 px-6 py-4">
          <h2 className="truncate text-lg font-medium text-white">
            {activeThread.title || "Untitled thread"}
          </h2>
        </div>
      ) : null}
      <div
        ref={scrollerRef}
        className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
      >
        {hasMessages ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <Message
                key={message.id}
                assistantName={assistantName}
                message={message}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[26rem] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-[var(--accent)]/25 bg-[var(--accent)]/10 text-[var(--accent)]">
              <SparkIcon className="h-7 w-7" />
            </div>

            <div className="mt-8 grid w-full max-w-3xl gap-3 md:grid-cols-3">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onPromptSelect(prompt)}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-sm leading-6 text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
