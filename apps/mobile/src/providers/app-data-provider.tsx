import { createContext, useContext, type PropsWithChildren } from "react";
import type { AppBootstrapData } from "@solo-agents/types";
import { useAppData } from "@/hooks/use-app-data";

type AppDataContextValue = {
  data: AppBootstrapData | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const appData = useAppData();
  return <AppDataContext.Provider value={appData}>{children}</AppDataContext.Provider>;
}

export function useAppDataContext(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppDataContext must be used within AppDataProvider");
  }
  return ctx;
}
