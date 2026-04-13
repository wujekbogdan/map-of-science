import { QdrantClient } from "@qdrant/js-client-rest";
import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { createAtlasStore } from "@map-of-science/atlas-store";
import { createClusterEmbedder } from "@map-of-science/cluster-embedder";
import { createEmbedder } from "@map-of-science/embeddings";
import { parseCsv, streamNdjsonFile } from "@map-of-science/parsers/node";
import { createRateLimitedFunction } from "@map-of-science/rate-limiter";
import { createBuildCluster } from "./buildCluster.js";
import {
  buildClusterLookups,
  type ClustersRow,
  type EntityNameRow,
  type LlmNameRow,
  type PlacesRow,
} from "./buildClusterLookups.js";
import { ingestClusters } from "./ingestClusters.js";

const envSchema = z.object({
  qdrant: z.object({
    url: z.string(),
    apiKey: z.string().optional(),
  }),
  gemini: z.object({
    apiKey: z.string(),
    rpm: z.coerce.number().default(10),
  }),
});

const cliSchema = z.object({
  etoInput: z.string(),
  clusters: z.string(),
  names: z.string(),
  places: z.string(),
  entities: z.string(),
  batchSize: z.coerce.number().int().positive().default(500),
  maxTitles: z.coerce.number().int().positive().optional(),
});

type Options = z.infer<typeof cliSchema>;

const etoRecordSchema = z
  .object({
    id: z.number(),
    articles: z.object({
      core: z.array(z.string()),
      review: z.array(z.string()),
      highlyCited: z.array(z.string()),
    }),
  })
  .transform((data) => ({
    id: String(data.id),
    titles: [
      ...new Set([
        ...data.articles.core,
        ...data.articles.review,
        ...data.articles.highlyCited,
      ]),
    ],
  }));

async function* streamEtoNdjson(path: string) {
  for await (const record of streamNdjsonFile(path)) {
    const parsed = etoRecordSchema.safeParse(record);
    if (!parsed.success) continue;
    if (parsed.data.titles.length === 0) continue;
    yield parsed.data;
  }
}

const readTsv = async <Row extends Record<string, string>>(path: string) => {
  const rows: Row[] = [];
  await parseCsv<Row, void>(
    () => readFile(path, "utf-8"),
    (row: Row) => {
      rows.push(row);
    },
  );
  return rows;
};

export const runIngestClusters = async (options: Options) => {
  const env = envSchema.parse({
    qdrant: {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    },
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
      rpm: process.env.GEMINI_RPM,
    },
  });
  const args = cliSchema.parse(options);

  const qdrant = new QdrantClient({
    url: env.qdrant.url,
    ...(env.qdrant.apiKey && { apiKey: env.qdrant.apiKey }),
  });
  const atlasStore = createAtlasStore({ qdrant });

  const embedder = createEmbedder(
    { provider: "gemini", apiKey: env.gemini.apiKey },
    "document",
  );
  const embedCluster = createClusterEmbedder({
    embed: createRateLimitedFunction(embedder.embed, env.gemini.rpm),
  });

  const [clustersRows, llmNameRows, placesRows, entityNameRows] =
    await Promise.all([
      readTsv<ClustersRow>(args.clusters),
      readTsv<LlmNameRow>(args.names),
      readTsv<PlacesRow>(args.places),
      readTsv<EntityNameRow>(args.entities),
    ]);

  const lookups = buildClusterLookups({
    clustersRows,
    llmNameRows,
    placesRows,
    entityNameRows,
  });
  const buildCluster = createBuildCluster(lookups);

  const result = await ingestClusters({
    clustersRepo: atlasStore.clusters,
    buildCluster,
    embedCluster: (cluster) =>
      embedCluster(cluster, {
        ...(args.maxTitles !== undefined && { maxTitles: args.maxTitles }),
      }),
    streamEto: streamEtoNdjson(args.etoInput),
    batchSize: args.batchSize,
  });

  console.log(`Ingested ${result.count} clusters.`);
};

export const createIngestClustersCommand = () => {
  const command = new Command("ingest:clusters");

  command
    .description("Ingest clusters (embeddings + positions + names) into Qdrant")
    .requiredOption("--eto-input <path>", "Path to ETO NDJSON")
    .requiredOption("--clusters <path>", "Path to clusters.tsv")
    .requiredOption("--names <path>", "Path to cluster_names_i18n.tsv")
    .requiredOption("--places <path>", "Path to places.tsv")
    .requiredOption("--entities <path>", "Path to map_entities_i18n.tsv")
    .option("--batch-size <n>", "Upsert batch size", "500")
    .option("--max-titles <n>", "Max titles per cluster to embed")
    .action(runIngestClusters);

  return command;
};
