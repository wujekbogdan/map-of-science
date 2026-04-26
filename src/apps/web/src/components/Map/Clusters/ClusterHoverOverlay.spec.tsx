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

afterEach(() => {
  cleanup();
});

describe("ClusterHoverOverlay", () => {
  it("should render nothing when no cluster is hovered", () => {
    const { queryByText } = render(<ClusterHoverOverlay cluster={null} />);
    expect(queryByText(/Hovered Cluster/)).toBeNull();
  });

  it("should render a tooltip with the hovered cluster's display name", () => {
    const { queryByText } = render(
      <ClusterHoverOverlay
        cluster={makeCluster({ id: "hovered", displayName: "Hovered Cluster" })}
      />,
    );
    expect(queryByText("Hovered Cluster")).toBeTruthy();
  });
});
