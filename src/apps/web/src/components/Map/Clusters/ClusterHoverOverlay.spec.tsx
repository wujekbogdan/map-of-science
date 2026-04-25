import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClusterHoverOverlay } from "./ClusterHoverOverlay.tsx";
import { type MapCluster } from "./ClusterShapes.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const makeCluster = (overrides: Partial<MapCluster> = {}): MapCluster => ({
  id: "cluster-1",
  externalId: 1,
  position: { x: 10, y: 20 },
  name: "Black Holes",
  displayName: "Black Holes",
  nameSource: "curated",
  articlesCount: 100,
  growthRating: 50,
  embedding: { model: "test", source: "titles" },
  keyConcepts: [],
  ...overrides,
});

const growthRatingColors = {
  start: { r: 0, g: 0, b: 0 },
  middle: { r: 128, g: 128, b: 128 },
  end: { r: 255, g: 255, b: 255 },
};

const baseProps = {
  mode: "regular" as const,
  ripple: false,
  growthRatingColors,
  articleThresholds: { 1: 2000, 2: 1000, 3: 500, 4: 200, 5: 50 } as const,
};

afterEach(() => {
  cleanup();
});

const renderOverlay = (cluster: MapCluster | null) =>
  render(
    <svg>
      <g>
        <ClusterHoverOverlay cluster={cluster} {...baseProps} />
      </g>
    </svg>,
  );

describe("ClusterHoverOverlay", () => {
  it("should render nothing when no cluster is hovered", () => {
    const { container, queryByText } = renderOverlay(null);
    expect(container.querySelector("circle")).toBeNull();
    expect(queryByText(/Hovered Cluster/)).toBeNull();
  });

  it("should render a highlighted shape and tooltip with the hovered cluster's display name", () => {
    const { container, queryByText } = renderOverlay(
      makeCluster({ id: "hovered", displayName: "Hovered Cluster" }),
    );
    expect(container.querySelector("circle")).toBeTruthy();
    expect(queryByText("Hovered Cluster")).toBeTruthy();
  });
});
