export const pickClustersToRender = <T extends { id: string }>(
  viewport: T[],
  highlighted: T[],
): T[] => {
  if (highlighted.length > 1) return highlighted;
  const viewportIds = new Set(viewport.map((cluster) => cluster.id));
  const extras = highlighted.filter((cluster) => !viewportIds.has(cluster.id));
  return [...viewport, ...extras];
};
