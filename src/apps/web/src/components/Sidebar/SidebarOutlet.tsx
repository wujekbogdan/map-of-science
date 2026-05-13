import { Outlet, useMatchRoute } from "@tanstack/react-router";
import { CLUSTER_ROUTE_PATH } from "../../cluster/routePath.ts";
import { Sidebar } from "./Sidebar.tsx";

export const SidebarOutlet = () => {
  const matchRoute = useMatchRoute();
  const isClusterRoute = !!matchRoute({ to: CLUSTER_ROUTE_PATH });
  return (
    <Sidebar isOpen={isClusterRoute}>
      <Outlet />
    </Sidebar>
  );
};
