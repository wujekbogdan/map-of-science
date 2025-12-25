import { Command, Option } from "commander";
import { z } from "zod";
import { createEmbedder } from "@map-of-science/embeddings";
import { createQdrantStore } from "@map-of-science/vector-store";

const envSchema = z.object({
  gemini: z.object({
    apiKey: z.string(),
  }),
  qdrant: z.object({
    url: z.string(),
    apiKey: z.string().optional(),
    collectionName: z.string().default("clusters"),
  }),
});

const cliSchema = z.object({
  query: z.string(),
  vector: z.enum(["articles", "concepts"]).default("articles"),
  limit: z.coerce.number().default(10),
});

const parseEnv = () =>
  envSchema.parse({
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
    },
    qdrant: {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: process.env.QDRANT_COLLECTION,
    },
  });

const createSearchConfig = (cliArgs: Record<string, unknown>) => ({
  ...parseEnv(),
  ...cliSchema.parse(cliArgs),
  embeddingDimension: 768 as const,
});

type SearchConfig = ReturnType<typeof createSearchConfig>;

const compose = (config: SearchConfig) => {
  const embedder = createEmbedder(
    { provider: "gemini", apiKey: config.gemini.apiKey },
    "query",
  );
  const store = createQdrantStore({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
    collectionName: config.qdrant.collectionName,
    vectors: {
      concepts: { size: config.embeddingDimension },
      articles: { size: config.embeddingDimension },
    },
  });

  return { embedder, store };
};

type SearchOptions = {
  vector?: string;
  limit?: string;
};

export const search = async (query: string, options: SearchOptions) => {
  const config = createSearchConfig({ query, ...options });
  const { embedder, store } = compose(config);

  const embedStart = performance.now();
  const { embedding } = await embedder.embed(config.query);
  const embedMs = performance.now() - embedStart;

  const searchStart = performance.now();
  const response = await store.search({
    query: {
      type: "single",
      using: config.vector,
      vector: embedding,
    },
    limit: config.limit,
  });
  const searchMs = performance.now() - searchStart;

  const output = {
    query: config.query,
    vector: config.vector,
    results: response.items,
    timing: {
      embedMs: Math.round(embedMs),
      searchMs: Math.round(searchMs),
    },
  };

  console.log(JSON.stringify(output, null, 2));

  return output;
};

export const createSearchCommand = () => {
  const command = new Command("search");

  command
    .description("Search clusters using vector similarity")
    .argument("<query>", "Search query text")
    .addOption(
      new Option("-v, --vector <name>", "Vector to search")
        .choices(["articles", "concepts"])
        .default("articles"),
    )
    .option("-l, --limit <n>", "Result limit", "10")
    .action(async (query: string, options: SearchOptions) => {
      await search(query, options);
    });

  return command;
};
