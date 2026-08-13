import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
} from "@tanstack/react-router";
import { ClusterPanel } from "./cluster/ClusterPanel/ClusterPanel.tsx";
import { CLUSTER_ROUTE_PATH } from "./cluster/routePath.ts";
import App from "./components/App.tsx";
import { searchParamsSchema } from "./components/Header/Search/searchParams.ts";

export const rootRoute = createRootRoute({
  validateSearch: searchParamsSchema,
  component: App,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => null,
});

const clusterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: CLUSTER_ROUTE_PATH,
  component: ClusterPanel,
});

const routeTree = rootRoute.addChildren([searchRoute, clusterRoute]);

export const createAppRouter = (initialEntries?: string[]) =>
  createRouter({
    routeTree,
    history: initialEntries
      ? createMemoryHistory({ initialEntries })
      : undefined,
  });

export const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
