export type ClusterLevel = 1 | 2 | 3 | 4 | 5 | 6;

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

export const getClusterLevel = (articlesCount: number): ClusterLevel => {
  if (articlesCount > 2000) return 1;
  if (articlesCount > 1000) return 2;
  if (articlesCount > 500) return 3;
  if (articlesCount > 200) return 4;
  if (articlesCount >= 50) return 5;
  return 6;
};
