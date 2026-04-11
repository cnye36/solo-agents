import { useMemo, useState } from "react";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ThreadSummary } from "@solo-agents/types";
import { colors, radii, spacing } from "@/constants/theme";
import { sendMessageStream } from "@/lib/api/chat-stream";
import { useSession } from "@/providers/session-provider";
import {
  EmptyState,
  ErrorBanner,
  InputField,
  PrimaryButton,
  SectionCard,
  SecondaryButton,
} from "@/components/ui";
import { formatMessageTime, trimPreview } from "@/features/chat/format";
import type { ChatMessage } from "@/features/chat/types";

type ChatScreenProps = {
  assistantName: string;
  initialThreads: ThreadSummary[];
};

function upsertThread(
  threads: ThreadSummary[],
  nextThread: ThreadSummary,
): ThreadSummary[] {
  const remaining = threads.filter((thread) => thread.id !== nextThread.id);
  return [nextThread, ...remaining];
}

export function ChatScreen({
  assistantName,
  initialThreads,
}: ChatScreenProps) {
  const { session } = useSession();
  const [threads, setThreads] = useState(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads],
  );

  async function handleSend() {
    const message = draft.trim();

    if (!message || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    const sentAt = new Date().toISOString();
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    const provisionalTitle = trimPreview(message, 44);
    const resolvedThreadTitle = activeThread?.title || provisionalTitle;
    let resolvedThreadId = activeThreadId;

    setMessages((current) => [
      ...current,
      {
        id: userMessageId,
        role: "user",
        content: message,
        createdAt: sentAt,
        status: "complete",
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
        session,
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
        sendError instanceof Error ? sendError.message : "Unable to send the message.";

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
    <>
      {error ? <ErrorBanner message={error} /> : null}

      <SectionCard
        title={assistantName}
        subtitle="Thread list and streaming replies powered by the existing Hono BFF."
        action={<SecondaryButton label="New thread" onPress={() => {
          setActiveThreadId(null);
          setMessages([]);
          setError(null);
        }} />}
      >
        <FlatList
          horizontal
          data={threads}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.threadRail}
          ListEmptyComponent={
            <View style={styles.threadEmpty}>
              <Text style={styles.threadEmptyText}>Your recent threads will appear here.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isActive = item.id === activeThreadId;
            return (
              <Pressable
                onPress={() => {
                  setActiveThreadId(item.id);
                  setMessages([]);
                  setError(null);
                }}
                style={[
                  styles.threadChip,
                  isActive && styles.threadChipActive,
                ]}
              >
                <Text style={styles.threadTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.threadPreview} numberOfLines={2}>
                  {item.preview || "Open thread"}
                </Text>
              </Pressable>
            );
          }}
        />
      </SectionCard>

      <SectionCard
        title={activeThread?.title ?? "New conversation"}
        subtitle={
          activeThread
            ? "Replies stream into the current thread as chunks arrive."
            : "Start a fresh conversation with your assistant."
        }
      >
        {messages.length ? (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageContent}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.role === "user" ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.messageRole}>
                    {item.role === "user" ? "You" : assistantName}
                  </Text>
                  <Text style={styles.messageTime}>{formatMessageTime(item.createdAt)}</Text>
                </View>
                {item.role === "assistant" ? (
                  <Markdown
                    style={markdownStyles}
                  >
                    {item.content}
                  </Markdown>
                ) : (
                  <Text style={styles.messageText}>{item.content}</Text>
                )}
                {item.status === "streaming" ? (
                  <View style={styles.streamingRow}>
                    <ActivityIndicator size="small" color={colors.accent} />
                    <Text style={styles.streamingText}>Streaming...</Text>
                  </View>
                ) : null}
              </View>
            )}
          />
        ) : (
          <EmptyState
            title="No messages yet"
            description="Send a prompt to create a thread and stream the response back into this screen."
          />
        )}
      </SectionCard>

      <SectionCard title="Composer">
        <InputField
          label="Message"
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask Northstar Assistant anything..."
          multiline
        />
        <PrimaryButton label="Send" onPress={handleSend} loading={isSending} disabled={!draft.trim()} />
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  threadRail: {
    gap: spacing.sm,
  },
  threadChip: {
    width: 220,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  threadChipActive: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.accentMuted,
  },
  threadTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  threadPreview: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  threadEmpty: {
    paddingVertical: spacing.md,
  },
  threadEmptyText: {
    color: colors.textMuted,
  },
  messageList: {
    maxHeight: 360,
  },
  messageContent: {
    gap: spacing.md,
  },
  messageBubble: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assistantBubble: {
    backgroundColor: "#11162b",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  messageRole: {
    color: colors.text,
    fontWeight: "700",
  },
  messageTime: {
    color: colors.textMuted,
    fontSize: 12,
  },
  messageText: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  streamingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  streamingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

const markdownStyles = {
  body: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700" as const,
  },
  heading2: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700" as const,
  },
  heading3: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700" as const,
  },
  bullet_list: {
    color: colors.textSoft,
  },
  code_block: {
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  fence: {
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  link: {
    color: "#c4b5fd",
  },
};
