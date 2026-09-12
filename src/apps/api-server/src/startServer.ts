import { QdrantClient } from "@qdrant/js-client-rest";
import { createSearch } from "@map-of-science/atlas";
import { createAtlasStore, type AtlasStore } from "@map-of-science/atlas-store";
import { createEmbedder } from "@map-of-science/embeddings";
import { createLogger } from "@map-of-science/logger";
import { loadConfig, type Config } from "./config.js";
import { createServer } from "./server.js";

const logger = createLogger();

/* Wide enough to hold every cluster, so the read always returns something */
const PROBE_BBOX = {
  x: { min: -1e9, max: 1e9 },
  y: { min: -1e9, max: 1e9 },
};

/* Queries a single cluster to verify the store responds.
 * The failure is logged here because `/ready` returns an empty body. */
const isStoreReady = async (atlas: AtlasStore) => {
  try {
    const clusters = await atlas.clusterAttributes.findInViewport({
      bbox: PROBE_BBOX,
      limit: 1,
    });
    return clusters.length > 0;
  } catch (error) {
    logger.error({ error }, "the readiness query to the store failed");
    return false;
  }
};

const compose = (config: Config) => {
  const qdrant = new QdrantClient({
    url: config.qdrant.url,
    ...(config.qdrant.apiKey && { apiKey: config.qdrant.apiKey }),
  });
  const atlas = createAtlasStore({ qdrant });
  const embedder = createEmbedder(
    { provider: "gemini", apiKey: config.gemini.apiKey },
    "query",
  );
  const search = createSearch({
    clusters: atlas.clusterAttributes,
    embedQuery: async (text) => {
      const { embedding } = await embedder.embed(text);
      return embedding;
    },
  });
  return { atlas, search };
};

export const startServer = () => {
  const config = loadConfig();
  const { atlas, search } = compose(config);

  const server = createServer({
    atlas,
    search,
    isReady: () => isStoreReady(atlas),
  });

  server.listen(config.port);
  logger.info(`Server running on http://localhost:${config.port}`);

  return server;
};
