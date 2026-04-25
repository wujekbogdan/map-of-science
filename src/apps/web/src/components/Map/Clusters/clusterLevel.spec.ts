import { describe, expect, it } from "vitest";
import { LABEL_DOT_GAP_PX } from "../../../map/labels/config.ts";
import { toLabeledCluster } from "./clusterLevel.ts";

const articleThresholds = {
  1: 2000,
  2: 1000,
  3: 500,
  4: 200,
  5: 50,
} as const;

const baseCluster = {
  id: "c",
  displayName: "Cluster",
  position: { x: 100, y: 200 },
};

const fontSizeByLevel = {
  1: 16,
  2: 14,
  3: 12,
  4: 10,
  5: 9,
  6: 6,
} as const;

describe("toLabeledCluster", () => {
  it("should attach the level, screen-compensated font size, and label offset to a cluster", () => {
    const labeled = toLabeledCluster({
      cluster: { ...baseCluster, articlesCount: 5000 },
      articleThresholds,
      fontSizeByLevel,
      zoomScale: 2,
    });

    expect(labeled).toEqual({
      id: "c",
      displayName: "Cluster",
      position: { x: 100, y: 200 },
      level: 1,
      fontSize: 8,
      labelOffsetPx: 8 + LABEL_DOT_GAP_PX,
    });
  });

  it("should pick the per-level font size for a smaller level", () => {
    const labeled = toLabeledCluster({
      cluster: { ...baseCluster, articlesCount: 10 },
      articleThresholds,
      fontSizeByLevel,
      zoomScale: 1,
    });

    expect(labeled.level).toBe(6);
    expect(labeled.fontSize).toBe(6);
    expect(labeled.labelOffsetPx).toBe(3 + LABEL_DOT_GAP_PX);
  });
});
