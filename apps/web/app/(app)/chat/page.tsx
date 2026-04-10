import { BootstrapSummary } from "@/features/bootstrap/bootstrap-summary";
import { ChatWorkspace } from "@/features/chat/chat-workspace";
import { getAppBootstrapData } from "@/lib/api/services/bootstrap-service";

export default async function ChatPage() {
  const data = await getAppBootstrapData();

  return (
    <div className="space-y-6">
      <ChatWorkspace
        assistant={data.assistant}
        recentThreads={data.recentThreads}
      />
      <BootstrapSummary todos={data.todos} />
    </div>
  );
}
