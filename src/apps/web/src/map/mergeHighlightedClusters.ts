// A selected cluster comes from a search and the active one from the panel query,
// so the two carry different fields. Only the id is needed here.
export const mergeHighlightedClusters = <
  Selected extends { id: string },
  Active extends { id: string },
>(
  selected: Map<string, Selected>,
  active: Active | null,
): (Selected | Active)[] => {
  const values = [...selected.values()];
  if (!active || selected.has(active.id)) return values;
  return [...values, active];
};
