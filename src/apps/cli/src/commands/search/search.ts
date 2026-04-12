import { Command } from "commander";
import { z } from "zod";
import { createSearch } from "@map-of-science/atlas";
import { createAtlasStore } from "@map-of-science/atlas-store";
import { createEmbedder } from "@map-of-science/embeddings";

const envSchema = z.object({
  gemini: z.object({
    apiKey: z.string(),
  }),
  qdrant: z.object({
    url: z.string(),
    apiKey: z.string().optional(),
  }),
});

const cliSchema = z.object({
  query: z.string(),
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
    },
  });

const createSearchConfig = (cliArgs: Record<string, unknown>) => ({
  ...parseEnv(),
  ...cliSchema.parse(cliArgs),
});

type SearchConfig = ReturnType<typeof createSearchConfig>;

const compose = (config: SearchConfig) => {
  const embedder = createEmbedder(
    { provider: "gemini", apiKey: config.gemini.apiKey },
    "query",
  );
  const store = createAtlasStore({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
  });

  return createSearch({
    clusters: store.clusters,
    embedQuery: async (text: string) => {
      const { embedding } = await embedder.embed(text);
      return embedding;
    },
  });
};

type SearchOptions = {
  limit?: string;
};

export const search = async (query: string, options: SearchOptions) => {
  const config = createSearchConfig({ query, ...options });
  const searchService = compose(config);

  const searchStart = performance.now();
  const results = await searchService.query({
    text: config.query,
    limit: config.limit,
  });
  const searchMs = performance.now() - searchStart;

  const output = {
    query: config.query,
    results,
    timing: { searchMs: Math.round(searchMs) },
  };

  console.log(JSON.stringify(output, null, 2));

  return output;
};

export const createSearchCommand = () => {
  const command = new Command("search");

  command
    .description("Search clusters using vector similarity")
    .argument("<query>", "Search query text")
    .option("-l, --limit <n>", "Result limit", "10")
    .action(async (query: string, options: SearchOptions) => {
      await search(query, options);
    });

  return command;
};
