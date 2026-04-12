import { QdrantClient } from "@qdrant/js-client-rest";
import { createAreasRepository } from "./areas/areas.js";
import { createClustersRepository } from "./clusters/clusters.js";
import { createContentRepository } from "./content/content.js";

export const createAtlasStore = ({
  url,
  apiKey,
}: {
  url: string;
  apiKey?: string;
}) => {
  const qdrant = new QdrantClient({
    url,
    ...(apiKey && { apiKey }),
  });

  const clusters = createClustersRepository({ qdrant });
  const areas = createAreasRepository({ qdrant });
  const content = createContentRepository({ qdrant });

  return {
    clusters,
    areas,
    content,
    async ensureSchemas() {
      await Promise.all([
        clusters.ensureSchema(),
        areas.ensureSchema(),
        content.ensureSchema(),
      ]);
    },
  };
};

export type AtlasStore = ReturnType<typeof createAtlasStore>;
