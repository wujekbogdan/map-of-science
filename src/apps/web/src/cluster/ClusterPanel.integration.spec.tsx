import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClusterPanel } from "./ClusterPanel.tsx";
import { CLUSTER_ROUTE_PATH } from "./routePath.ts";

vi.mock("../components/Article/IframeArticle.tsx", () => ({
  IframeArticle: ({ id }: { id: string }) => (
    <div data-testid="iframe-article">{id}</div>
  ),
}));

vi.mock("../map/view/hooks.ts", () => ({
  useMapView: () => ({ centerOn: vi.fn() }),
}));

vi.mock("./useViewedCluster.ts", () => ({
  useViewedCluster: () => null,
}));

vi.mock("../map/mapStore.ts", () => ({
  useMapStore: (selector: (state: unknown) => unknown) =>
    selector({
      clusterLevelArticleThreshold: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      clusterFocusZoom: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    }),
}));

describe("ClusterPanel", () => {
  it("should render IframeArticle with the cluster id from the URL", async () => {
    const testRoot = createRootRoute({ component: () => <Outlet /> });
    const testClusterRoute = createRoute({
      getParentRoute: () => testRoot,
      path: CLUSTER_ROUTE_PATH,
      component: ClusterPanel,
    });
    const router = createRouter({
      routeTree: testRoot.addChildren([testClusterRoute]),
      history: createMemoryHistory({
        initialEntries: ["/cluster/abc-123"],
      }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("iframe-article").textContent).toBe("abc-123");
    });
  });
});
