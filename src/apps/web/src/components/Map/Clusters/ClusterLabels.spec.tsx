import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PlacedLabel } from "../../../map/labels/useLabelPlacement.ts";
import { ClusterLabels } from "./ClusterLabels.tsx";

const makeLabel = (overrides: Partial<PlacedLabel> = {}): PlacedLabel => ({
  id: "a",
  position: { x: 10, y: 100 },
  layout: { lines: ["Alpha"], widthAtRefFont: 30, heightAtRefFont: 11.5 },
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
  it("should render one text per label, positioned above the cluster", () => {
    const { container, queryByText } = renderInSvg(
      <ClusterLabels
        labels={[makeLabel({ id: "a", position: { x: 10, y: 100 } })]}
        fontSize={12}
        offset={15}
      />,
    );

    const textEl = container.querySelector("text");
    expect(textEl?.getAttribute("y")).toBe("85");
    expect(queryByText("Alpha")).toBeTruthy();
  });

  it("should render a tspan per wrapped line", () => {
    const { queryByText } = renderInSvg(
      <ClusterLabels
        labels={[
          makeLabel({
            layout: {
              lines: ["Fundamental research", "in quantum"],
              widthAtRefFont: 120,
              heightAtRefFont: 23,
            },
          }),
        ]}
        fontSize={12}
        offset={15}
      />,
    );

    expect(queryByText("Fundamental research")).toBeTruthy();
    expect(queryByText("in quantum")).toBeTruthy();
  });

  it("should render nothing when there are no labels", () => {
    const { container } = renderInSvg(
      <ClusterLabels labels={[]} fontSize={12} offset={15} />,
    );

    expect(container.querySelector("text")).toBeNull();
  });
});
