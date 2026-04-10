import { FilesOverview } from "@/features/files/files-overview";
import { getAppBootstrapData } from "@/lib/api/services/bootstrap-service";

export default async function FilesPage() {
  const data = await getAppBootstrapData();

  return <FilesOverview files={data.files} />;
}
