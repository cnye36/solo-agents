import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

type AppShellProps = {
  title: string;
  subtitle: string;
  userEmail?: string | null;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, userEmail, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden lg:flex">
      <AppSidebar userEmail={userEmail} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppTopbar title={title} subtitle={subtitle} userEmail={userEmail} />
        <main className="flex min-h-0 flex-1 flex-col px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
