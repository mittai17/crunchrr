import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { createApiClient, type ApiClient } from "@crunchrr/api-client";
const Context = createContext<ApiClient | null>(null);
export function ApiProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const api = useMemo(
    () =>
      createApiClient(
        process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api/v1",
        () => getToken(),
      ),
    [getToken],
  );
  return <Context.Provider value={api}>{children}</Context.Provider>;
}
export function useApi() {
  const api = useContext(Context);
  if (!api) throw new Error("Missing API provider");
  return api;
}
