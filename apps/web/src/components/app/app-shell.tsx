import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden lg:flex">
      <AppSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppTopbar title={title} subtitle={subtitle} />
        <main className="flex min-h-0 flex-1 flex-col px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
