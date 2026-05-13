export const mergeHighlightedClusters = <T extends { id: string }>(
  selected: Map<string, T>,
  active: T | null,
): T[] => {
  const values = [...selected.values()];
  if (!active || selected.has(active.id)) return values;
  return [...values, active];
};
