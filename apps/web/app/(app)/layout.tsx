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
      title="Solo Agents"
      subtitle="A focused workspace for personal AI assistants, persistent threads, and file-aware drafting."
    >
      {children}
    </AppShell>
  );
}
