import { useNavigate } from "@tanstack/react-router";
import { CLUSTER_ROUTE_PATH } from "./routePath.ts";

declare module "@tanstack/react-router" {
  interface HistoryState {
    source?: "map";
  }
}

export const useNavigateToCluster = () => {
  const navigate = useNavigate();
  return (id: string, options?: { fromMap?: boolean }) =>
    navigate({
      to: CLUSTER_ROUTE_PATH,
      params: { id },
      state: { source: options?.fromMap ? "map" : undefined },
      search: (prev) => prev,
    });
};
