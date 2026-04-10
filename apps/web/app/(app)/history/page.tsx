import { HistoryOverview } from "@/features/history/history-overview";
import { getAppBootstrapData } from "@/lib/api/services/bootstrap-service";

export default async function HistoryPage() {
  const data = await getAppBootstrapData();

  return <HistoryOverview threads={data.recentThreads} />;
}
