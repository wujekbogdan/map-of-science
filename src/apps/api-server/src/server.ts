import { QdrantClient } from "@qdrant/js-client-rest";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { appRouter, createContext } from "@map-of-science/api";
import { createSearch } from "@map-of-science/atlas";
import { createAtlasStore } from "@map-of-science/atlas-store";
import { createEmbedder } from "@map-of-science/embeddings";
import { loadConfig, type Config } from "./config.js";

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
    clusters: atlas.clusters,
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

  const server = createHTTPServer({
    middleware: cors(),
    router: appRouter,
    createContext: ({ req }) => createContext({ req, atlas, search }),
  });

  server.listen(config.port);
  console.log(`Server running on http://localhost:${config.port}`);

  return server;
};
