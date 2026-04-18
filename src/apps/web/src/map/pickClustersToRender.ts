export const pickClustersToRender = <T>(viewport: T[], selected: T[]) =>
  selected.length > 0 ? selected : viewport;
