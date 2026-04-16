export const mergeClustersById = <T extends { id: string }>(
  viewport: T[],
  selection: T[],
) => {
  const viewportIds = new Set(viewport.map((cluster) => cluster.id));
  const extras = selection.filter((cluster) => !viewportIds.has(cluster.id));
  return [...viewport, ...extras];
};
