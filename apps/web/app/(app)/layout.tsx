import { AppShell } from "@/components/app/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      title="Northstar Assistant"
      subtitle="A chat-first client layer built to sit on top of the existing AffinityBots runtime."
    >
      {children}
    </AppShell>
  );
}
