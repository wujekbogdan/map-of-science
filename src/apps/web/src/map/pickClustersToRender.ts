// The viewport clusters and the highlighted ones come from different queries, so
// the two carry different fields. Only the id is needed here.
export const pickClustersToRender = <
  Viewport extends { id: string },
  Highlighted extends { id: string },
>(
  viewport: Viewport[],
  highlighted: Highlighted[],
): (Viewport | Highlighted)[] => {
  if (highlighted.length > 1) return highlighted;
  const viewportIds = new Set(viewport.map((cluster) => cluster.id));
  const extras = highlighted.filter((cluster) => !viewportIds.has(cluster.id));
  return [...viewport, ...extras];
};
