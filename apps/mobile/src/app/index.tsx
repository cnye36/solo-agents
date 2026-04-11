import { AppShell } from "@/components/app-shell";
import { AuthScreen } from "@/features/auth/auth-screen";
import { useSession } from "@/providers/session-provider";

export default function IndexScreen() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  return session ? <AppShell /> : <AuthScreen />;
}
