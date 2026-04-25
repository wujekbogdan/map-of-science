import type { ZoomTransform } from "d3";
import { useMemo } from "react";
import type { ClusterLevel } from "../../components/Map/Clusters/clusterLevel.ts";
import type { LabelLayout } from "./computeLabelLayout.ts";
import { MAX_LABEL_WIDTH_PX } from "./config.ts";
import { labelBbox } from "./labelBbox.ts";
import { placeLabels } from "./placeLabels.ts";

type ClusterInput = {
  id: string;
  displayName: string;
  position: { x: number; y: number };
  labelOffsetPx: number;
  fontSize: number;
  level: ClusterLevel;
};

type Layouter = (text: string, budgetPx: number) => LabelLayout;

export const useLabelPlacement = ({
  clusters,
  transform,
  layouter,
  minZoomByLevel,
  maxLabels,
}: {
  clusters: ClusterInput[];
  transform: ZoomTransform | undefined;
  layouter: Layouter;
  minZoomByLevel: Record<ClusterLevel, number>;
  maxLabels?: number;
}) => {
  return useMemo(() => {
    if (!transform) return [];

    // Smaller clusters need a deeper zoom before their label appears, the
    // same way smaller towns reveal later on a road map.
    const visible = clusters.filter(
      (cluster) => transform.k >= minZoomByLevel[cluster.level],
    );
    const capped =
      maxLabels === undefined ? visible : visible.slice(0, maxLabels);

    if (capped.length === 0) return [];

    // Server returns clusters ordered by articlesCount DESC; the biggest
    // cluster wins placement first.
    const withLayout = capped.map((cluster) => ({
      id: cluster.id,
      position: cluster.position,
      layout: layouter(cluster.displayName, MAX_LABEL_WIDTH_PX),
      labelOffsetPx: cluster.labelOffsetPx,
      fontSize: cluster.fontSize,
    }));

    const candidates = withLayout.map(
      ({ id, position, layout, labelOffsetPx, fontSize }) => {
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
  }, [clusters, transform, layouter, minZoomByLevel, maxLabels]);
};

export type PlacedLabel = ReturnType<typeof useLabelPlacement>[number];
