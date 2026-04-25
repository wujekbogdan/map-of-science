import type { ZoomTransform } from "d3";
import { useMemo } from "react";
import type { LabelLayout } from "./computeLabelLayout.ts";
import { LABEL_MIN_ZOOM, MAX_LABEL_WIDTH_PX } from "./config.ts";
import { labelBbox } from "./labelBbox.ts";
import { placeLabels } from "./placeLabels.ts";

type ClusterInput = {
  id: string;
  displayName: string;
  position: { x: number; y: number };
  labelOffsetPx: number;
};

type Layouter = (text: string, budgetPx: number) => LabelLayout;

export const useLabelPlacement = ({
  clusters,
  transform,
  fontSize,
  layouter,
}: {
  clusters: ClusterInput[];
  transform: ZoomTransform | undefined;
  fontSize: number;
  layouter: Layouter;
}) => {
  return useMemo(() => {
    if (!transform || transform.k < LABEL_MIN_ZOOM) return [];

    // Server returns clusters ordered by articlesCount DESC; the biggest
    // cluster wins placement first.
    const withLayout = clusters.map((cluster) => ({
      id: cluster.id,
      position: cluster.position,
      layout: layouter(cluster.displayName, MAX_LABEL_WIDTH_PX),
      labelOffsetPx: cluster.labelOffsetPx,
    }));

    const candidates = withLayout.map(
      ({ id, position, layout, labelOffsetPx }) => {
        const [x, y] = transform.apply([position.x, position.y]);
        return {
          id,
          bbox: labelBbox({
            anchor: { x, y },
            layout,
            fontSizePx: fontSize * transform.k,
            offsetPx: labelOffsetPx,
          }),
        };
      },
    );

    const kept = placeLabels({ candidates });

    return withLayout.filter(({ id }) => kept.has(id));
  }, [clusters, transform, fontSize, layouter]);
};

export type PlacedLabel = ReturnType<typeof useLabelPlacement>[number];
