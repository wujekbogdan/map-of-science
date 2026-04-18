import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ClusterLabels } from "./ClusterLabels.tsx";
import { type MapCluster } from "./ClusterShapes.tsx";

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

const renderInSvg = (ui: React.ReactNode) =>
  render(
    <svg>
      <g>{ui}</g>
    </svg>,
  );

afterEach(() => {
  cleanup();
});

describe("ClusterLabels", () => {
  it("should render labels only for curated clusters, positioned above each cluster", () => {
    const clusters: MapCluster[] = [
      makeCluster({
        id: "a",
        displayName: "Alpha",
        nameSource: "curated",
        position: { x: 10, y: 100 },
      }),
      makeCluster({
        id: "b",
        displayName: "Beta",
        nameSource: "llm",
      }),
      makeCluster({
        id: "c",
        displayName: "Gamma",
        nameSource: null,
      }),
    ];

    const { queryByText } = renderInSvg(
      <ClusterLabels
        clusters={clusters}
        label={{ fontSize: 12, opacity: 1, offset: 15 }}
      />,
    );

    const alpha = queryByText("Alpha");
    expect(alpha).toBeTruthy();
    expect(alpha!.getAttribute("y")).toBe("85");
    expect(queryByText("Beta")).toBeNull();
    expect(queryByText("Gamma")).toBeNull();
  });

  it("should render nothing when label opacity is zero", () => {
    const { queryByText } = renderInSvg(
      <ClusterLabels
        clusters={[makeCluster({ displayName: "Alpha" })]}
        label={{ fontSize: 12, opacity: 0, offset: 15 }}
      />,
    );

    expect(queryByText("Alpha")).toBeNull();
  });
});
