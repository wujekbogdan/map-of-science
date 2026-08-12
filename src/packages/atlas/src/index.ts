/* See ../README.md for the domain overview. */

export {
  bboxSchema,
  clusterInputSchema,
  clusterSchema,
} from "./clusters/clusters.js";
export { rankRelatedClusters } from "./clusters/rankRelatedClusters.js";
export type {
  BBox,
  Cluster,
  ClusterInput,
  ClusterMatch,
  ClusterRepository,
} from "./clusters/clusters.js";

export { areaSchema } from "./areas/areas.js";
export type { Area, AreaRepository } from "./areas/areas.js";

export {
  contentItemSchema,
  entityRefSchema,
  youtubeSegmentContentSchema,
} from "./content/content.js";
export type {
  ContentItem,
  ContentRepository,
  EntityRef,
} from "./content/content.js";

export { createSearch } from "./search/search.js";
export type { EmbedQuery, Search } from "./search/search.js";
export { DEFAULT_SORT, sortValueSchema } from "./search/sort.js";
export type { SortValue } from "./search/sort.js";
