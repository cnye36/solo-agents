"use client";

import { MarkdownRenderer } from "@/features/chat/markdown-renderer";
import { formatMessageTime } from "@/features/chat/chat-format";
import type { ChatMessage } from "@/features/chat/chat-types";

type MessageProps = {
  assistantName: string;
  message: ChatMessage;
};

function AttachmentPill({
  name,
  sizeLabel,
}: {
  name: string;
  sizeLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-800/35 px-3 py-2">
      <p className="truncate text-sm font-medium text-white">{name}</p>
      <p className="mt-1 text-xs text-zinc-400">{sizeLabel}</p>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-2 text-zinc-400">
      <span>Thinking</span>
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:300ms]" />
      </span>
    </div>
  );
}

export function Message({ assistantName, message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[82%] space-y-3 rounded-[28px] rounded-br-lg border border-white/10 bg-[linear-gradient(180deg,rgba(63,63,70,0.55),rgba(39,39,42,0.38))] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
            : "w-full max-w-[min(860px,100%)] space-y-3 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(39,39,42,0.92),rgba(24,24,27,0.78))] px-5 py-5 shadow-[0_20px_48px_rgba(0,0,0,0.18)]"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              {isUser ? "You" : assistantName}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
              {formatMessageTime(message.createdAt)}
            </p>
          </div>
          {message.status === "error" ? (
            <span className="rounded-full border border-rose-400/25 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-rose-200">
              Error
            </span>
          ) : null}
        </div>

        {message.attachments?.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {message.attachments.map((attachment) => (
              <AttachmentPill
                key={attachment.id}
                name={attachment.name}
                sizeLabel={attachment.sizeLabel}
              />
            ))}
          </div>
        ) : null}

        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-zinc-100">
            {message.content}
          </p>
        ) : message.content ? (
          <MarkdownRenderer content={message.content} />
        ) : message.status === "streaming" ? (
          <ThinkingDots />
        ) : null}
      </div>
    </div>
  );
}
