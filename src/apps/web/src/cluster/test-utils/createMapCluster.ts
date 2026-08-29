import type { RouterOutputs } from "../../api-client/index.ts";

type MapCluster = RouterOutputs["cluster"]["viewport"][number];

/** The cluster shape `cluster.viewport` and `search.query` answer with. Override only the fields a spec is about. */
export const createMapCluster = (
  overrides: Partial<MapCluster> = {},
): MapCluster => ({
  id: "cluster-1",
  externalId: 1,
  position: { x: 10, y: 20 },
  displayName: "Black Holes",
  articlesCount: 100,
  growthRating: 50,
  keyConcepts: [],
  ...overrides,
});
