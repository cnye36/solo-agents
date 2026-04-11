"use client";

import { useMemo, useState } from "react";
import type { AssistantSummary, ThreadSummary } from "@solo-agents/types";
import { trimPreview } from "@/features/chat/chat-format";
import { Composer } from "@/features/chat/composer";
import { ThreadSidebar } from "@/features/chat/thread-sidebar";
import { ThreadView } from "@/features/chat/thread-view";
import type {
  AttachmentDraft,
  ChatMessage,
} from "@/features/chat/chat-types";
import { sendMessageStream } from "@/lib/api/services/chat-service";

type ChatWorkspaceProps = {
  assistant: AssistantSummary;
  recentThreads: ThreadSummary[];
};

const suggestedPrompts = [
  "Turn these notes into a structured project brief.",
  "Review the current plan and show the biggest risks.",
  "Help me break this goal into concrete next actions.",
];

function upsertThread(
  threads: ThreadSummary[],
  nextThread: ThreadSummary,
): ThreadSummary[] {
  const remaining = threads.filter((thread) => thread.id !== nextThread.id);
  return [nextThread, ...remaining];
}

export function ChatWorkspace({
  assistant,
  recentThreads,
}: ChatWorkspaceProps) {
  const [threads, setThreads] = useState<ThreadSummary[]>(recentThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads],
  );

  function handleNewThread() {
    setActiveThreadId(null);
    setMessages([]);
    setDraft("");
    setError(null);
  }

  function handleSelectThread(thread: ThreadSummary) {
    setActiveThreadId(thread.id);
    setMessages([]);
    setError(null);
  }

  async function handleSend({
    message,
    attachments,
  }: {
    message: string;
    attachments: AttachmentDraft[];
  }) {
    if (!message.trim() || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    const sentAt = new Date().toISOString();
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    const provisionalTitle = trimPreview(message, 44);
    let resolvedThreadId = activeThreadId;
    const resolvedThreadTitle = activeThread?.title || provisionalTitle;

    setMessages((current) => [
      ...current,
      {
        id: userMessageId,
        role: "user",
        content: message,
        createdAt: sentAt,
        status: "complete",
        attachments,
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "streaming",
      },
    ]);

    setDraft("");

    try {
      await sendMessageStream(
        {
          message,
          ...(activeThreadId ? { threadId: activeThreadId } : {}),
        },
        {
          onThreadId(threadId) {
            resolvedThreadId = threadId;
            setActiveThreadId(threadId);
            setThreads((current) =>
              upsertThread(current, {
                id: threadId,
                title: resolvedThreadTitle,
                preview: trimPreview(message),
                updatedAt: new Date().toISOString(),
              }),
            );
          },
          onTextDelta(text) {
            setMessages((current) =>
              current.map((entry) =>
                entry.id === assistantMessageId
                  ? { ...entry, content: `${entry.content}${text}` }
                  : entry,
              ),
            );
          },
        },
      );

      setMessages((current) =>
        current.map((entry) =>
          entry.id === assistantMessageId
            ? {
                ...entry,
                content:
                  entry.content ||
                  "The assistant run completed, but it did not return visible text.",
                status: "complete",
              }
            : entry,
        ),
      );

      setThreads((current) =>
        upsertThread(current, {
          id: resolvedThreadId ?? `draft-${Date.now()}`,
          title: resolvedThreadTitle,
          preview: trimPreview(message),
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch (sendError) {
      const messageText =
        sendError instanceof Error
          ? sendError.message
          : "Unable to send the message.";

      setError(messageText);
      setMessages((current) =>
        current.map((entry) =>
          entry.id === assistantMessageId
            ? {
                ...entry,
                content: messageText,
                status: "error",
              }
            : entry,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">

      {error ? (
        <div className="shrink-0 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)]">
        <ThreadSidebar
          activeThreadId={activeThreadId}
          threads={threads}
          onNewThread={handleNewThread}
          onSelectThread={handleSelectThread}
        />

        <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <ThreadView
            assistantName={assistant.name}
            activeThread={activeThread}
            messages={messages}
            suggestedPrompts={suggestedPrompts}
            onPromptSelect={setDraft}
          />

          <Composer
            draft={draft}
            isSending={isSending}
            onDraftChange={setDraft}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
