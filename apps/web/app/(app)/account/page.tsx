import { AccountOverview } from "@/features/account/account-overview";
import { getAppBootstrapData } from "@/lib/api/services/bootstrap-service";

export default async function AccountPage() {
  const data = await getAppBootstrapData();

  return (
    <AccountOverview
      email={data.user.email}
      planName={data.billing.planName}
      renewalLabel={data.billing.renewalLabel}
    />
  );
}
