import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { translations } from "../../i18n/translations.ts";
import { CLUSTER_ROUTE_PATH } from "../routePath.ts";
import { useViewedCluster, type ViewedCluster } from "../useViewedCluster.ts";
import { ClusterPanel } from "./ClusterPanel.tsx";
import { createViewedCluster } from "./test-utils/createViewedCluster.ts";

afterEach(cleanup);

vi.mock("../../map/view/hooks.ts", () => ({
  useMapView: () => ({ centerOn: vi.fn() }),
}));

vi.mock("../useViewedCluster.ts", () => ({
  useViewedCluster: vi.fn(),
}));

vi.mock("../../map/mapStore.ts", () => ({
  useMapStore: (selector: (state: unknown) => unknown) =>
    selector({
      clusterLevelArticleThreshold: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      clusterFocusZoom: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 },
    }),
}));

const renderPanel = async (cluster: ViewedCluster = createViewedCluster()) => {
  vi.mocked(useViewedCluster).mockReturnValue(cluster);

  const testRoot = createRootRoute({ component: () => <Outlet /> });
  const testClusterRoute = createRoute({
    getParentRoute: () => testRoot,
    path: CLUSTER_ROUTE_PATH,
    component: ClusterPanel,
  });
  const router = createRouter({
    routeTree: testRoot.addChildren([testClusterRoute]),
    history: createMemoryHistory({ initialEntries: ["/cluster/abc-123"] }),
  });
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng: "en",
    resources: { en: { translation: translations.en } },
  });

  return render(
    <I18nextProvider i18n={instance}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
};

describe("ClusterPanel", () => {
  it("should render every section of the cluster description", async () => {
    await renderPanel();

    await waitFor(() => {
      expect(screen.getByText("6701 recent articles")).toBeTruthy();
    });

    expect(
      screen.getByText("sulfur batteries, high sulfur loading"),
    ).toBeTruthy();
    expect(screen.getByText("Key recent articles")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Key journals" })).toBeTruthy();
    expect(screen.getByText("Chemical Engineering Journal")).toBeTruthy();
    expect(screen.getByText("Related clusters")).toBeTruthy();
    expect(screen.getByText("Rating scale")).toBeTruthy();
  });

  it("should title the panel with the cluster name and its ETO id", async () => {
    await renderPanel();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
        "Lithium-sulfur batteries (#1085)",
      );
    });
  });

  it("should title the panel with the placeholder alone when the cluster has no name", async () => {
    await renderPanel(
      createViewedCluster({ name: null, displayName: "Cluster #1085" }),
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
        "Cluster #1085",
      );
    });
  });

  it("should omit a section the cluster holds no data for", async () => {
    await renderPanel();

    await waitFor(() => {
      expect(screen.getByText("6701 recent articles")).toBeTruthy();
    });

    expect(screen.queryByText("Review articles")).toBeNull();
  });
});
