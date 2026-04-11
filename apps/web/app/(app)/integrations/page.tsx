import { IntegrationsOverview } from "@/features/integrations/integrations-overview";
import { listIntegrationCatalog } from "@/lib/api/services/integrations-service";

export default async function IntegrationsPage() {
  const data = await listIntegrationCatalog();

  return <IntegrationsOverview apps={data.apps} />;
}
