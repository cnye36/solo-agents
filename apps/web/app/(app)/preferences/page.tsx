import { PreferencesOverview } from "@/features/preferences/preferences-overview";
import { getAppBootstrapData } from "@/lib/api/services/bootstrap-service";

export default async function PreferencesPage() {
  const data = await getAppBootstrapData();

  return <PreferencesOverview groups={data.preferences} />;
}
