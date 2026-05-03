import { useMemo } from "react";
import type { CSSProperties } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { createLabelLayouter } from "../../../map/labels/createLabelLayouter.ts";
import { createSvgMeasureText } from "../../../map/labels/createSvgMeasureText.ts";
import { useLabelPlacement } from "../../../map/labels/useLabelPlacement.ts";
import { ClusterLabels } from "./ClusterLabels.tsx";
import type { ClusterLevel } from "./clusterLevel.ts";
import css from "./clusters.module.scss";

type LabeledCluster = {
  id: string;
  displayName: string;
  position: { x: number; y: number };
  level: ClusterLevel;
  fontSize: number;
  labelOffsetPx: number;
};

const SVG_SIZE = 1000;
const ZOOM_OK = 10;

// Min zoom is uniform here so the harness exercises rendering and CSS, not
// the per-level threshold logic - that lives in `useLabelPlacement.spec.ts`.
const MIN_ZOOM_BY_LEVEL = {
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
} as const;

const LabelsHarness = ({
  zoomScale,
  clusters,
}: {
  zoomScale: number;
  clusters: LabeledCluster[];
}) => {
  const layouter = useMemo(
    () => createLabelLayouter({ measureText: createSvgMeasureText() }),
    [],
  );
  const labels = useLabelPlacement({
    clusters,
    transform: { x: 0, y: 0, scale: zoomScale },
    layouter,
    minZoomByLevel: MIN_ZOOM_BY_LEVEL,
  });

  return (
    <svg
      data-testid="map"
      width={SVG_SIZE}
      height={SVG_SIZE}
      viewBox={`0 0 ${SVG_SIZE.toString()} ${SVG_SIZE.toString()}`}
      style={{ "--zoom-scale": zoomScale } as CSSProperties}
    >
      <g transform={`scale(${zoomScale.toString()})`}>
        {clusters.map((cluster) => (
          <circle
            key={`${cluster.id}-dot`}
            data-testid={`${cluster.id}-dot`}
            cx={cluster.position.x}
            cy={cluster.position.y}
            className={css[`level-${cluster.level.toString()}`]}
            fill="black"
          />
        ))}
        <ClusterLabels labels={labels} zoomScale={zoomScale} />
      </g>
    </svg>
  );
};

const labeled = (overrides: Partial<LabeledCluster> = {}): LabeledCluster => ({
  id: "a",
  displayName: "Alpha",
  position: { x: 100, y: 100 },
  level: 1,
  // World-space font size at zoom 10. The outer scale(10) brings it back to
  // 16 screen px - the screen-px size of the level-1 label.
  fontSize: 16 / ZOOM_OK,
  labelOffsetPx: 8 + 14,
  ...overrides,
});

describe("ClusterLabels in a browser-rendered SVG", () => {
  it("should keep a constant screen-pixel gap between the dot and the label across zoom levels", async () => {
    const measureGap = (container: Element) => {
      const dotRect = container
        .querySelector(`[data-testid="a-dot"]`)!
        .getBoundingClientRect();
      const textRect = container.querySelector("text")!.getBoundingClientRect();
      const dotCenterY = dotRect.top + dotRect.height / 2;
      return Math.round(textRect.top - dotCenterY);
    };

    const atZoom10 = await render(
      <LabelsHarness
        zoomScale={10}
        clusters={[labeled({ fontSize: 16 / 10 })]}
      />,
    );
    const gap10 = measureGap(atZoom10.container);
    await atZoom10.unmount();

    const atZoom20 = await render(
      <LabelsHarness
        zoomScale={20}
        clusters={[labeled({ fontSize: 16 / 20 })]}
      />,
    );
    const gap20 = measureGap(atZoom20.container);

    expect(gap10).toBe(gap20);
  });

  it("should render cluster dots at a constant screen-pixel diameter across zoom levels", async () => {
    const measureDiameter = (container: Element) =>
      Math.round(
        container
          .querySelector(`[data-testid="a-dot"]`)!
          .getBoundingClientRect().width,
      );

    const atZoom10 = await render(
      <LabelsHarness zoomScale={10} clusters={[labeled()]} />,
    );
    const diameter10 = measureDiameter(atZoom10.container);
    await atZoom10.unmount();

    const atZoom20 = await render(
      <LabelsHarness
        zoomScale={20}
        clusters={[labeled({ fontSize: 16 / 20 })]}
      />,
    );
    const diameter20 = measureDiameter(atZoom20.container);

    // Level-1 radius is 8 px, so the diameter is 16 px.
    expect({ diameter10, diameter20 }).toEqual({
      diameter10: 16,
      diameter20: 16,
    });
  });

  it("should render the cluster label at a constant screen-pixel size across zoom levels", async () => {
    const measureLabelHeight = (container: Element) =>
      Math.round(
        container.querySelector("text")!.getBoundingClientRect().height,
      );

    const atZoom10 = await render(
      <LabelsHarness
        zoomScale={10}
        clusters={[labeled({ fontSize: 16 / 10 })]}
      />,
    );
    const height10 = measureLabelHeight(atZoom10.container);
    await atZoom10.unmount();

    const atZoom20 = await render(
      <LabelsHarness
        zoomScale={20}
        clusters={[labeled({ fontSize: 16 / 20 })]}
      />,
    );
    const height20 = measureLabelHeight(atZoom20.container);

    expect(height10).toBe(height20);
  });
});
