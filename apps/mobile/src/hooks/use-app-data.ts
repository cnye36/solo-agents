import { useCallback, useEffect, useState } from "react";
import type { AppBootstrapData } from "@solo-agents/types";
import { getAppBootstrapData } from "@/lib/api/services";
import { useSession } from "@/providers/session-provider";

export function useAppData() {
  const { session } = useSession();
  const [data, setData] = useState<AppBootstrapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAppBootstrapData(session);

      if ("assistant" in result && result.assistant === null) {
        setData(null);
        setError("Assistant provisioning is not configured yet.");
      } else {
        setData(result);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load app data.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    error,
    isLoading,
    refresh,
  };
}
