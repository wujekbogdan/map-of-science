import { Command } from "commander";
import { createClusterEmbedder } from "@map-of-science/cluster-embedder";
import { createEmbedder } from "@map-of-science/embeddings";
import { streamNdjsonFile } from "@map-of-science/parsers/node";
import { createRateLimitedFunction } from "@map-of-science/rate-limiter";
import { createQdrantStore } from "@map-of-science/vector-store";
import { createConfig, type Config } from "../../config.js";
import { forEachEntry } from "../../utils/stream.js";
import { clusterDataSchema } from "./schema.js";

const compose = (config: Config) => {
  const embedder = createEmbedder(
    { provider: "gemini", apiKey: config.gemini.apiKey },
    "document",
  );
  const store = createQdrantStore({
    url: config.qdrant.url,
    apiKey: config.qdrant.apiKey,
    collectionName: config.qdrant.collectionName,
    vectors: {
      titles: { size: config.embeddingDimension },
    },
  });

  const embedCluster = createClusterEmbedder({
    embed: createRateLimitedFunction(embedder.embed, config.rateLimits.gemini),
    upsert: (params) => store.upsert(params),
  });

  return { embedCluster };
};

type EmbedOptions = {
  input: string;
  start?: string;
  limit?: string;
  maxTitles?: string;
};

export const embed = async (options: EmbedOptions) => {
  const config = createConfig(options);
  const { embedCluster } = compose(config);

  const processed = await forEachEntry(
    streamNdjsonFile(config.input),
    { start: config.start, limit: config.limit },
    async (record, position) => {
      const result = clusterDataSchema.safeParse(record);

      if (!result.success) {
        console.warn(`Skipping invalid cluster at position ${position}`);
        return;
      }

      console.log(
        `Processing cluster ${position}/${config.limit} (id: ${result.data.id})`,
      );

      await embedCluster(result.data, { maxTitles: config.maxTitles });
    },
  );

  console.log(`Done. Processed ${processed} clusters.`);

  return { processed };
};

export const createEmbedCommand = () => {
  const command = new Command("embed");

  command
    .description("Embed clusters from NDJSON file into vector store")
    .requiredOption("-i, --input <path>", "Path to clusters NDJSON file")
    .option("-s, --start <number>", "Start index (0-based)")
    .option("-l, --limit <number>", "Number of clusters to process")
    .option("-m, --max-titles <number>", "Max titles per cluster")
    .action(async (options: EmbedOptions) => {
      await embed(options);
    });

  return command;
};
