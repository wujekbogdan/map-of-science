import { memo } from "react";
import type { RouterOutputs } from "../../../api-client/index.ts";
import type { RGB } from "../../../map/mapStore.ts";
import Shape from "./Shape.tsx";
import { getClusterLevel, type ArticleThresholds } from "./clusterLevel.ts";
import css from "./clusters.module.scss";

export type MapCluster = RouterOutputs["cluster"]["viewport"][number];

type Props = {
  clusters: MapCluster[];
  articleThresholds: ArticleThresholds;
  mode: "regular" | "growth";
  ripplingIds: Set<string>;
  highlightedIds: Set<string>;
  growthRatingColors: { start: RGB; middle: RGB; end: RGB };
  onHoveredClusterChange: (id: string | null) => void;
  onClusterClick: (id: string) => void;
  hoveredId?: string | null;
  popoverAnchorId?: string | null;
  onHoveredElChange?: (el: SVGGElement | null) => void;
};

const getPercentage = (index: number, total: number) =>
  Math.round(((index + 1) / total) * 100);

export const ClusterShapes = memo(function ClusterShapes({
  clusters,
  articleThresholds,
  mode,
  ripplingIds,
  highlightedIds,
  growthRatingColors,
  onHoveredClusterChange,
  onClusterClick,
  hoveredId,
  popoverAnchorId,
  onHoveredElChange,
}: Props) {
  return (
    <>
      {clusters.map((cluster, index) => (
        <g
          key={cluster.id}
          className={css.fadeIn}
          data-test-cluster-id={cluster.id}
          ref={cluster.id === popoverAnchorId ? onHoveredElChange : undefined}
          aria-label={cluster.displayName}
          onPointerEnter={() => {
            onHoveredClusterChange(cluster.id);
          }}
          onPointerLeave={() => {
            onHoveredClusterChange(null);
          }}
          onClick={() => {
            onClusterClick(cluster.id);
          }}
        >
          <Shape
            progress={getPercentage(index, clusters.length)}
            level={getClusterLevel(cluster.articlesCount, articleThresholds)}
            point={{
              growthRating: cluster.growthRating,
              x: cluster.position.x,
              y: cluster.position.y,
            }}
            ripple={ripplingIds.has(cluster.id)}
            halo={highlightedIds.has(cluster.id)}
            mode={mode}
            forcedHover={cluster.id === hoveredId}
            growthRatingColors={growthRatingColors}
          />
        </g>
      ))}
    </>
  );
});
