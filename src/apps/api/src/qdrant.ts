import { QdrantClient } from "@qdrant/js-client-rest";
import { parse as csvParse } from "csv-parse";
import { createReadStream } from "node:fs";
import { z } from "zod";
import { config } from "./config.js";
import { Extractor } from "./extractor.js";

export const client = new QdrantClient({
  host: config.qdrant.host,
  port: config.qdrant.port,
});

const Schema = z
  .object({
    cluster_id: z.coerce.number(),
    concepts: z.string().transform((str) => str.split(",").map(Number)),
    embeddings: z
      .string()
      .transform((str) => str.split(",").map(Number))
      .refine((arr) => arr.length === 384, {
        message: "Embeddings must have exactly 384 dimensions",
      }),
  })
  .transform((data) => ({
    concepts: data.concepts,
    embeddings: data.embeddings,
    clusterId: data.cluster_id,
  }));

export async function* parse(file: string, batchSize = 100) {
  const parser = createReadStream(file).pipe(
    csvParse({
      delimiter: "\t",
      columns: true,
      bom: true,
    }),
  );

  let batch = [];
  for await (const record of parser) {
    const parsed = Schema.parse(record);
    batch.push(parsed);

    if (batch.length >= batchSize) {
      yield batch;
      batch = [];
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}

export const upsert = async (file: string) => {
  const collectionName = "clusters";
  const { exists: hasCollection } =
    await client.collectionExists(collectionName);
  if (!hasCollection) {
    await client.createCollection(collectionName, {
      vectors: { size: 384, distance: "Cosine" },
    });
  }

  for await (const clusters of parse(file)) {
    console.log(`Upserting ${clusters.length} clusters`);
    const points = clusters.map((cluster) => ({
      id: cluster.clusterId,
      vector: cluster.embeddings,
    }));

    await client.upsert(collectionName, {
      points,
    });
  }
};

const ResultSchema = z.object({
  id: z.number(),
  score: z.number(),
});

type SearchOptions = {
  query: string;
  limit?: number;
  scoreThreshold?: number;
};

export const search = async (options: SearchOptions) => {
  const { query, limit = 1000, scoreThreshold = 0.5 } = options;
  const { extract } = Extractor();
  const { data } = await extract(query);

  if (!data.length) {
    return [];
  }

  const result = data[0];
  const response = await client.search("clusters", {
    vector: result.embedding,
    limit,
    score_threshold: scoreThreshold,
  });
  return response.map((item) => ResultSchema.parse(item));
};
