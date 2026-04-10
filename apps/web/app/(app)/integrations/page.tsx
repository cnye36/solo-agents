import { IntegrationsOverview } from "@/features/integrations/integrations-overview";
import { getAppBootstrapData } from "@/lib/api/services/bootstrap-service";

export default async function IntegrationsPage() {
  const data = await getAppBootstrapData();

  return <IntegrationsOverview apps={data.connectedApps} />;
}
