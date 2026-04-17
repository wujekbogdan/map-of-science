import { z } from "zod";

export const clusterSchema = z
  .object({
    id: z.string().describe("Unique cluster identifier."),
    externalId: z.number().describe("Cluster ID from ETO."),
    position: z.object({
      x: z.number().describe("Horizontal coordinate, increases rightward."),
      y: z.number().describe("Vertical coordinate, increases upward."),
    }),
    name: z
      .object({
        en_US: z.string(),
        pl_PL: z.string(),
      })
      .nullable()
      .describe("Cluster name per language. Null when unnamed."),
    nameSource: z
      .enum(["curated", "llm"])
      .nullable()
      .describe(
        'How the name was produced. "curated" = hand-picked, "llm" = generated. Null when unnamed.',
      ),
    articlesCount: z
      .number()
      .describe("Number of articles the cluster was built from."),
    growthRating: z
      .number()
      .describe(
        "Percentile 0-100 showing how fast the cluster grew over the last 3 years vs other clusters, per ETO.",
      ),
    embedding: z
      .object({
        model: z.string().describe("Which embedder produced it."),
        source: z
          .string()
          .describe("What kind of content was used as input to the embedding."),
      })
      .describe("Info about the embedding."),
    keyConcepts: z
      .array(z.string())
      .default([])
      .describe("Keywords tagging the cluster's key concepts, per ETO."),
  })
  .describe(
    "A group of scientific articles that share a topic. Clusters are the foundation - every other entity is positioned relative to them.",
  );

export const clusterInputSchema = clusterSchema
  .extend({
    vector: z.array(z.number()).describe("Embedding vector for the cluster."),
  })
  .describe(
    "Cluster with its embedding vector. Used as the input when writing clusters.",
  );

const rangeSchema = z
  .object({
    min: z.number().describe("Lower bound."),
    max: z.number().describe("Upper bound."),
  })
  .describe("Min/max on a single axis, inclusive.");

export const bboxSchema = z
  .object({
    x: rangeSchema.describe("Horizontal range."),
    y: rangeSchema.describe("Vertical range."),
  })
  .describe("2D rectangular region.");

export type Cluster = z.infer<typeof clusterSchema>;
export type ClusterInput = z.infer<typeof clusterInputSchema>;
export type BBox = z.infer<typeof bboxSchema>;

/* Cluster paired with a similarity score from a vector search. */
export type ClusterMatch = Cluster & { score: number };

/* Storage interface for clusters. */
export type ClusterRepository = {
  /* Set up cluster storage. Run once. */
  createSchema(): Promise<void>;
  /* Add or update clusters. */
  upsert(items: ClusterInput[]): Promise<void>;
  /* Get one cluster by id. Null if not found. */
  findById(id: string): Promise<Cluster | null>;
  /* Get multiple clusters by id. */
  findByIds(ids: string[]): Promise<Cluster[]>;
  /* Get clusters whose position falls inside the bounding box. */
  findInViewport(args: { bbox: BBox; limit: number }): Promise<Cluster[]>;
  /* Find clusters most similar to the given embedding. */
  findByVector(args: {
    vector: number[];
    limit: number;
  }): Promise<ClusterMatch[]>;
};
