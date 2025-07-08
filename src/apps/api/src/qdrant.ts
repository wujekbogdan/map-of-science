import { QdrantClient } from "@qdrant/js-client-rest";
import { parse as csvParse } from "csv-parse";
import "dotenv/config";
import { createReadStream } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { concepts, Extractor } from "./extractor.js";

const here = dirname(fileURLToPath(import.meta.url));

export const client = new QdrantClient({
  url: process.env.QDRANT_API_URL,
  apiKey: process.env.QDRANT_API_KEY,
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
  const hasCollection = await client.collectionExists(collectionName);
  if (!hasCollection) {
    await client.createCollection(collectionName, {
      vectors: { size: 384, distance: "Cosine" },
    });
  }

  for await (const clusters of parse(file)) {
    const points = clusters.map((cluster) => ({
      id: cluster.clusterId,
      vector: cluster.embeddings,
      payload: {
        clusterId: cluster.clusterId,
        concepts: cluster.concepts,
      },
    }));

    await client.upsert(collectionName, {
      points,
    });
  }
};

const ResultSchema = z.object({
  id: z.number(),
  score: z.number(),
  payload: z.object({
    clusterId: z.number(),
    concepts: z.array(z.number()),
  }),
});

export const search = async (query: string, limit = 10) => {
  const { extract } = await Extractor();
  const queryVector = await extract(query);
  const response = await client.search("clusters", {
    vector: queryVector,
    limit,
  });
  const conceptsMap = await concepts(resolve(here, "../assets/concepts.tsv"));
  return response.map((item) => {
    const parsed = ResultSchema.parse(item);
    return {
      ...parsed,
      concepts: parsed.payload.concepts
        .map((id) => conceptsMap.get(id))
        .filter((concept) => concept !== undefined),
    };
  });
};
