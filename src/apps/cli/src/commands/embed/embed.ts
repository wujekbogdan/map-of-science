import { Command } from "commander";
import { createClusterEmbedder } from "@map-of-science/cluster-embedder";
import { createEmbedder } from "@map-of-science/embeddings";
import { createOpenAlexClient } from "@map-of-science/openalex";
import { streamJsonFile } from "@map-of-science/parsers/node";
import { createRateLimitedFunction } from "@map-of-science/rate-limiter";
import { createQdrantStore } from "@map-of-science/vector-store";
import { createConfig, type Config } from "../../config.js";
import { clusterDataSchema } from "./schema.js";
import { forEachEntry } from "./stream.js";

const compose = (config: Config) => {
  const openAlex = createOpenAlexClient(config.openAlex);
  const embedder = createEmbedder(
    { provider: "gemini", apiKey: config.gemini.apiKey },
    "document",
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

  const embedCluster = createClusterEmbedder({
    fetchWorks: createRateLimitedFunction(
      openAlex.fetchWorks,
      config.rateLimits.openAlex,
    ),
    embed: createRateLimitedFunction(embedder.embed, config.rateLimits.gemini),
    upsert: (params) => store.upsert(params),
  });

  return { embedCluster };
};

type EmbedOptions = {
  input: string;
  start?: string;
  limit?: string;
  maxArticles?: string;
};

export const embed = async (options: EmbedOptions) => {
  const config = createConfig(options);
  const { embedCluster } = compose(config);

  const generator = streamJsonFile<string, unknown>(config.input);

  const processed = await forEachEntry(
    generator,
    { start: config.start, limit: config.limit },
    async (key, value) => {
      const cluster = clusterDataSchema.parse(value);

      console.log(`Processing cluster ${key}/${config.limit}`);
      await embedCluster(
        { id: key, ...cluster },
        { maxArticles: config.maxArticles },
      );
    },
  );

  console.log(`Done. Processed ${processed} clusters.`);

  return { processed };
};

export const createEmbedCommand = () => {
  const command = new Command("embed");

  command
    .description("Embed clusters from JSON file into vector store")
    .requiredOption("-i, --input <path>", "Path to clusters JSON file")
    .option("-s, --start <number>", "Start index (0-based)")
    .option("-l, --limit <number>", "Number of clusters to process")
    .option("-m, --max-articles <number>", "Max articles per cluster")
    .action(async (options: EmbedOptions) => {
      await embed(options);
    });

  return command;
};
