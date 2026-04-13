import { useCallback, useMemo, useRef, useState } from "react";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ThreadSummary } from "@solo-agents/types";
import { colors, radii, spacing } from "@/constants/theme";
import { sendMessageStream } from "@/lib/api/chat-stream";
import { useSession } from "@/providers/session-provider";
import { formatMessageTime, trimPreview } from "@/features/chat/format";
import type { ChatMessage } from "@/features/chat/types";

type ChatScreenProps = {
  assistantName: string;
  initialThreads: ThreadSummary[];
};

function upsertThread(threads: ThreadSummary[], next: ThreadSummary): ThreadSummary[] {
  return [next, ...threads.filter((t) => t.id !== next.id)];
}

export function ChatScreen({ assistantName, initialThreads }: ChatScreenProps) {
  const { session } = useSession();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [threads, setThreads] = useState(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? null,
    [activeThreadId, threads],
  );

  const startNewThread = useCallback(() => {
    setActiveThreadId(null);
    setMessages([]);
    setError(null);
  }, []);

  async function handleSend() {
    const message = draft.trim();
    if (!message || isSending) return;

    setIsSending(true);
    setError(null);

    const sentAt = new Date().toISOString();
    const userMsgId = `user-${Date.now()}`;
    const asstMsgId = `assistant-${Date.now()}`;
    const provisionalTitle = trimPreview(message, 44);
    const resolvedTitle = activeThread?.title ?? provisionalTitle;
    let resolvedThreadId = activeThreadId;

    setMessages((cur) => [
      ...cur,
      { id: userMsgId, role: "user", content: message, createdAt: sentAt, status: "complete" },
      { id: asstMsgId, role: "assistant", content: "", createdAt: new Date().toISOString(), status: "streaming" },
    ]);
    setDraft("");

    // Scroll to bottom after adding messages
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await sendMessageStream(
        session,
        { message, ...(activeThreadId ? { threadId: activeThreadId } : {}) },
        {
          onThreadId(threadId) {
            resolvedThreadId = threadId;
            setActiveThreadId(threadId);
            setThreads((cur) =>
              upsertThread(cur, {
                id: threadId,
                title: resolvedTitle,
                preview: trimPreview(message),
                updatedAt: new Date().toISOString(),
              }),
            );
          },
          onTextDelta(text) {
            setMessages((cur) =>
              cur.map((m) =>
                m.id === asstMsgId ? { ...m, content: `${m.content}${text}` } : m,
              ),
            );
            setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
          },
        },
      );

      setMessages((cur) =>
        cur.map((m) =>
          m.id === asstMsgId
            ? {
                ...m,
                content: m.content || "The assistant run completed without visible text.",
                status: "complete",
              }
            : m,
        ),
      );

      setThreads((cur) =>
        upsertThread(cur, {
          id: resolvedThreadId ?? `draft-${Date.now()}`,
          title: resolvedTitle,
          preview: trimPreview(message),
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to send message.";
      setError(msg);
      setMessages((cur) =>
        cur.map((m) => (m.id === asstMsgId ? { ...m, content: msg, status: "error" } : m)),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarDot} />
          <View style={styles.headerTitles}>
            <Text style={styles.assistantName}>{assistantName}</Text>
            <Text style={styles.threadName} numberOfLines={1}>
              {activeThread?.title ?? "New conversation"}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowHistory(true)}
            style={styles.headerButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="time-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={startNewThread}
            style={[styles.headerButton, styles.newChatButton]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error bar */}
      {error ? (
        <View style={styles.errorBar}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
          <Text style={styles.errorText} numberOfLines={2}>
            {error}
          </Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Messages + Composer */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <View style={styles.emptyChatIcon}>
              <Ionicons name="chatbubbles-outline" size={40} color={colors.accent} />
            </View>
            <Text style={styles.emptyChatTitle}>Start a conversation</Text>
            <Text style={styles.emptyChatSubtitle}>
              Ask {assistantName} anything. Responses stream back in real time.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageContent}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => <MessageBubble message={item} assistantName={assistantName} />}
          />
        )}

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${assistantName}…`}
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.composerInput}
            onSubmitEditing={() => void handleSend()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => void handleSend()}
            disabled={!draft.trim() || isSending}
            style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Ionicons name="arrow-up" size={20} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Thread History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Conversations</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          {threads.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Text style={styles.modalEmptyText}>No past conversations yet.</Text>
            </View>
          ) : (
            <FlatList
              data={threads}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => {
                const isActive = item.id === activeThreadId;
                return (
                  <Pressable
                    onPress={() => {
                      setActiveThreadId(item.id);
                      setMessages([]);
                      setError(null);
                      setShowHistory(false);
                    }}
                    style={[styles.threadRow, isActive && styles.threadRowActive]}
                  >
                    <View style={styles.threadRowLeft}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color={isActive ? colors.accent : colors.textMuted}
                      />
                      <View style={styles.threadCopy}>
                        <Text style={styles.threadRowTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        {item.preview ? (
                          <Text style={styles.threadRowPreview} numberOfLines={1}>
                            {item.preview}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {isActive ? (
                      <Ionicons name="checkmark" size={18} color={colors.accent} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MessageBubble({
  message,
  assistantName,
}: {
  message: ChatMessage;
  assistantName: string;
}) {
  const isUser = message.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
      {!isUser && (
        <View style={styles.asstAvatar}>
          <Ionicons name="sparkles" size={14} color={colors.accent} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.asstBubble]}>
        {isUser ? (
          <Text style={styles.userBubbleText}>{message.content}</Text>
        ) : (
          <>
            <Markdown style={markdownStyles}>{message.content}</Markdown>
            {message.status === "streaming" && (
              <View style={styles.streamingIndicator}>
                <View style={[styles.streamDot, styles.streamDot1]} />
                <View style={[styles.streamDot, styles.streamDot2]} />
                <View style={[styles.streamDot, styles.streamDot3]} />
              </View>
            )}
          </>
        )}
        <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
          {formatMessageTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  avatarDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentMuted,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitles: {
    flex: 1,
    gap: 2,
  },
  assistantName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  threadName: {
    color: colors.textMuted,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  newChatButton: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.borderStrong,
  },

  // Error bar
  errorBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(251, 113, 133, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(251, 113, 133, 0.2)",
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },

  // Empty chat state
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyChatIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyChatTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyChatSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  // Messages
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },

  // Bubbles
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
    maxWidth: "85%",
  },
  bubbleRowRight: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  bubbleRowLeft: {
    alignSelf: "flex-start",
  },
  asstAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    flexShrink: 0,
  },
  bubble: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: 4,
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  asstBubble: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubbleText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTime: {
    color: "rgba(148, 163, 184, 0.6)",
    fontSize: 11,
    marginTop: 2,
  },
  bubbleTimeUser: {
    color: "rgba(255,255,255,0.55)",
    textAlign: "right",
  },

  // Streaming dots
  streamingIndicator: {
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  streamDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    opacity: 0.7,
  },
  streamDot1: {},
  streamDot2: { opacity: 0.5 },
  streamDot3: { opacity: 0.3 },

  // Composer
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingBottom: Platform.OS === "ios" ? spacing.md : spacing.sm,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
  },

  // Thread History Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  modalList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  modalEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalEmptyText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  threadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  threadRowActive: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.accentMuted,
  },
  threadRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  threadCopy: {
    flex: 1,
    gap: 2,
  },
  threadRowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  threadRowPreview: {
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
  heading1: { color: colors.text, fontSize: 22, fontWeight: "700" as const, marginBottom: 4 },
  heading2: { color: colors.text, fontSize: 18, fontWeight: "700" as const, marginBottom: 4 },
  heading3: { color: colors.text, fontSize: 16, fontWeight: "700" as const, marginBottom: 4 },
  bullet_list: { color: colors.textSoft },
  ordered_list: { color: colors.textSoft },
  code_inline: {
    backgroundColor: colors.surfaceMuted,
    color: "#c4b5fd",
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  code_block: {
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  fence: {
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  link: { color: "#c4b5fd" },
  blockquote: {
    borderLeftColor: colors.accent,
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    opacity: 0.85,
  },
};
