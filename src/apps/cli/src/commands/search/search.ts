import { Command, Option } from "commander";
import { z } from "zod";
import { createEmbedder } from "@map-of-science/embeddings";
import { createQdrantStore } from "@map-of-science/vector-store";
import type {
  FusionStrategy,
  PrefetchQuery,
} from "@map-of-science/vector-store";

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

const vectorsSchema = z.preprocess(
  (val) =>
    typeof val === "string" ? val.split(",").map((v) => v.trim()) : val,
  z.array(z.string().min(1)).min(1),
);

const fusionAliases = {
  rrf: "rrf",
  "rank-fusion": "rrf",
  dbsf: "dbsf",
  "score-fusion": "dbsf",
  weighted: "weighted",
} as const;

const fusionSchema = z
  .enum(["rrf", "rank-fusion", "dbsf", "score-fusion", "weighted"])
  .transform((val) => fusionAliases[val]);

const weightsSchema = z.preprocess(
  (val) =>
    typeof val === "string" ? val.split(":").map((v) => v.trim()) : val,
  z.array(z.coerce.number()).min(2),
);

const cliSchema = z
  .object({
    query: z.string(),
    vector: vectorsSchema.default(["titles"]),
    fusion: fusionSchema.optional(),
    weights: weightsSchema.optional(),
    limit: z.coerce.number().default(10),
  })
  .refine((data) => !(data.vector.length > 1 && !data.fusion), {
    message:
      "Multiple vectors requires --fusion (rrf, score-fusion, or weighted)",
  })
  .refine((data) => !(data.fusion && data.vector.length < 2), {
    message:
      "--fusion requires multiple vectors (e.g., --vector titles,concepts)",
  })
  .refine((data) => !(data.weights && data.fusion !== "weighted"), {
    message: "--weights requires --fusion weighted",
  })
  .refine((data) => !(data.fusion === "weighted" && !data.weights), {
    message: "--fusion weighted requires --weights (e.g., --weights 3:1)",
  })
  .refine(
    (data) => !data.weights || data.weights.length === data.vector.length,
    {
      message:
        "--weights count must match --vector count (e.g., --vector titles,concepts --weights 3:1)",
    },
  );

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

const createSearchConfig = (cliArgs: Record<string, unknown>) => {
  const cli = cliSchema.parse(cliArgs);
  return {
    ...parseEnv(),
    ...cli,
    embeddingDimension: 768 as const,
  };
};

type SearchConfig = ReturnType<typeof createSearchConfig>;

const compose = (config: SearchConfig) => {
  const embedder = createEmbedder(
    { provider: "gemini", apiKey: config.gemini.apiKey },
    "query",
  );
  const vectors = Object.fromEntries(
    config.vector.map((name) => [name, { size: config.embeddingDimension }]),
  );
  const store = createQdrantStore({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
    collectionName: config.qdrant.collectionName,
    vectors,
  });

  return { embedder, store };
};

type SearchOptions = {
  vector?: string;
  fusion?: string;
  weights?: string;
  limit?: string;
};

const PREFETCH_MULTIPLIER = 10;

const buildPrefetch = (
  vector: string[],
  embedding: number[],
  limit: number,
): PrefetchQuery[] =>
  vector.map((using) => ({ vector: embedding, using, limit }));

const buildSearchQuery = (config: SearchConfig, embedding: number[]) => {
  const { vector, fusion, weights, limit } = config;

  if (vector.length === 1) {
    return {
      type: "single" as const,
      using: vector[0],
      vector: embedding,
    };
  }

  const prefetchLimit = limit * PREFETCH_MULTIPLIER;
  const prefetch = buildPrefetch(vector, embedding, prefetchLimit);

  const fusionStrategy: FusionStrategy =
    fusion === "weighted"
      ? { type: "weightedSum", weights: weights! }
      : fusion === "dbsf"
        ? { type: "dbsf" }
        : { type: "rrf" };

  return {
    type: "multi" as const,
    prefetch,
    fusion: fusionStrategy,
  };
};

const formatValidationError = (error: z.ZodError): string =>
  error.issues.map((e) => e.message).join("\n");

const parseConfig = (query: string, options: SearchOptions) => {
  try {
    return createSearchConfig({ query, ...options });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(formatValidationError(error));
    }
    throw error;
  }
};

export const search = async (query: string, options: SearchOptions) => {
  const config = parseConfig(query, options);
  const { embedder, store } = compose(config);

  const embedStart = performance.now();
  const { embedding } = await embedder.embed(config.query);
  const embedMs = performance.now() - embedStart;

  const searchQuery = buildSearchQuery(config, embedding);

  const searchStart = performance.now();
  const response = await store.search({
    query: searchQuery,
    limit: config.limit,
  });
  const searchMs = performance.now() - searchStart;

  const output = {
    query: config.query,
    mode: config.vector.length === 1 ? "single" : "hybrid",
    vectors: config.vector,
    ...(config.fusion && { fusion: config.fusion }),
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
      new Option("-v, --vector <names>", "Vector(s) to search").default(
        "titles",
      ),
    )
    .addOption(
      new Option(
        "-f, --fusion <strategy>",
        "Strategy for combining multiple vectors",
      ).choices(["rrf", "rank-fusion", "dbsf", "score-fusion", "weighted"]),
    )
    .addOption(
      new Option(
        "-w, --weights <ratio>",
        "Importance ratio for weighted fusion (e.g., 3:1)",
      ),
    )
    .option("-l, --limit <n>", "Result limit", "10")
    .action(async (query: string, options: SearchOptions) => {
      await search(query, options);
    });

  return command;
};
