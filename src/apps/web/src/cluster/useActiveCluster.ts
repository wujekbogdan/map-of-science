import { useQuery } from "@tanstack/react-query";
import { useMatchRoute } from "@tanstack/react-router";
import { useTRPC } from "../api-client/index.ts";
import { CLUSTER_ROUTE_PATH } from "./routePath.ts";

export const useActiveCluster = () => {
  const matchRoute = useMatchRoute();
  const match = matchRoute({ to: CLUSTER_ROUTE_PATH });
  const id = match ? match.id : null;
  const trpc = useTRPC();
  const { data: cluster = null } = useQuery(
    trpc.cluster.byId.queryOptions({ id: id ?? "" }, { enabled: id !== null }),
  );
  return cluster;
};
