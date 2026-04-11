import { ChatWorkspace } from "@/features/chat/chat-workspace";
import { getAppBootstrapData } from "@/lib/api/services/bootstrap-service";

export default async function ChatPage() {
  const data = await getAppBootstrapData();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatWorkspace
        assistant={data.assistant}
        recentThreads={data.recentThreads}
      />
    </div>
  );
}
