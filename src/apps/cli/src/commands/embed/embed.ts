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
  });

  return { embedCluster, store };
};

type EmbedOptions = {
  input: string;
  start?: string;
  limit?: string;
  maxTitles?: string;
};

export const embed = async (options: EmbedOptions) => {
  const config = createConfig(options);
  const { embedCluster, store } = compose(config);

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

      // TODO: this command will be replaced by `ingest:clusters` which
      // combines data from multiple sources (PDFs + TSVs) and upserts
      // full ClusterInput via atlas-store. Until then, the upsert goes
      // directly to vector-store with the old metadata shape.
      const { vector } = await embedCluster(result.data, {
        maxTitles: config.maxTitles,
      });
      await store.upsert({
        id: result.data.id,
        vectors: { titles: vector },
        metadata: {
          clusterId: result.data.id,
          totalArticles: result.data.totalArticles,
          embedding: { titlesCount: result.data.titles.length },
        },
      });
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
