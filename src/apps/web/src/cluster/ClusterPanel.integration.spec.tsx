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
