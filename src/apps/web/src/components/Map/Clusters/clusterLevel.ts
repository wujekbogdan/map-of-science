import { LABEL_DOT_GAP_PX } from "../../../map/labels/config.ts";
import { useMapStore } from "../../../map/mapStore.ts";

export type ClusterLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Levels 1-5 each have a minimum article count above which a cluster is
// promoted into that level. Anything below level 5's minimum lands in level 6.
export type ArticleThresholds = Record<1 | 2 | 3 | 4 | 5, number>;

// Screen-space dot radius per level. Mirrors `$sizes` in
// `./clusters.module.scss` - keep the two lists in sync.
export const CLUSTER_DOT_RADII_PX: Record<ClusterLevel, number> = {
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
};

export const getClusterLevel = (
  articlesCount: number,
  thresholds: ArticleThresholds,
): ClusterLevel => {
  if (articlesCount > thresholds[1]) return 1;
  if (articlesCount > thresholds[2]) return 2;
  if (articlesCount > thresholds[3]) return 3;
  if (articlesCount > thresholds[4]) return 4;
  if (articlesCount >= thresholds[5]) return 5;
  return 6;
};

export const getClusterDotRadiusPx = (
  articlesCount: number,
  thresholds: ArticleThresholds,
): number => CLUSTER_DOT_RADII_PX[getClusterLevel(articlesCount, thresholds)];

// Binds the radius lookup to the current store thresholds so consumers
// outside the map (e.g. search dropdown rows) can ask for a radius from a
// raw articlesCount without threading thresholds through props.
export const useClusterDotRadius = () => {
  const thresholds = useMapStore((state) => state.clusterLevelArticleThreshold);
  return (articlesCount: number) =>
    getClusterDotRadiusPx(articlesCount, thresholds);
};

// Augments a cluster with the metadata its label needs: level, font size in
// world space (pre-divided by the current zoom so the outer transform brings
// it back to the desired screen-pixel size), and the offset that drops the
// label below the dot.
export const toLabeledCluster = <
  TCluster extends {
    id: string;
    displayName: string;
    position: { x: number; y: number };
    articlesCount: number;
  },
>({
  cluster,
  articleThresholds,
  fontSizeByLevel,
  zoomScale,
}: {
  cluster: TCluster;
  articleThresholds: ArticleThresholds;
  fontSizeByLevel: Record<ClusterLevel, number>;
  zoomScale: number;
}) => {
  const level = getClusterLevel(cluster.articlesCount, articleThresholds);
  return {
    id: cluster.id,
    displayName: cluster.displayName,
    position: cluster.position,
    level,
    fontSize: fontSizeByLevel[level] / zoomScale,
    labelOffsetPx: CLUSTER_DOT_RADII_PX[level] + LABEL_DOT_GAP_PX,
  };
};
