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
};

type Layouter = (text: string, budgetPx: number) => LabelLayout;

export const useLabelPlacement = ({
  clusters,
  transform,
  fontSize,
  offset,
  layouter,
}: {
  clusters: ClusterInput[];
  transform: ZoomTransform | undefined;
  fontSize: number;
  offset: number;
  layouter: Layouter;
}) => {
  return useMemo(() => {
    if (!transform || transform.k < LABEL_MIN_ZOOM) return [];

    // Server returns clusters ordered by articlesCount DESC; the biggest cluster
    // wins placement first.
    const withLayout = clusters.map((cluster) => ({
      id: cluster.id,
      cluster,
      layout: layouter(cluster.displayName, MAX_LABEL_WIDTH_PX),
    }));

    const candidates = withLayout.map(({ id, cluster, layout }) => ({
      id,
      bbox: labelBbox({ cluster, layout, transform, fontSize, offset }),
    }));

    const kept = placeLabels({ candidates });

    return withLayout
      .filter(({ id }) => kept.has(id))
      .map(({ id, layout }) => ({ id, layout }));
  }, [clusters, transform, fontSize, offset, layouter]);
};
