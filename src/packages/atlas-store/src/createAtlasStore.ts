import type { QdrantClient } from "@qdrant/js-client-rest";
import { createAreasRepository } from "./areas/areas.js";
import { createClustersRepository } from "./clusters/clusters.js";
import { createContentRepository } from "./content/content.js";

export const createAtlasStore = ({ qdrant }: { qdrant: QdrantClient }) => ({
  clusters: createClustersRepository({ qdrant }),
  areas: createAreasRepository({ qdrant }),
  content: createContentRepository({ qdrant }),
});

export type AtlasStore = ReturnType<typeof createAtlasStore>;
