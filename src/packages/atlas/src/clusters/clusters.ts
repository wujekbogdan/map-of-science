import { z } from "zod";

export const clusterSchema = z.object({
  id: z.string(),
  externalId: z.number(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  name: z
    .object({
      en_US: z.string(),
      pl_PL: z.string(),
    })
    .nullable(),
  nameSource: z.enum(["curated", "llm"]).nullable(),
  articlesCount: z.number(),
  growthRating: z.number(),
  embedding: z.object({
    model: z.string(),
    source: z.string(),
  }),
});

export const clusterInputSchema = clusterSchema.extend({
  vector: z.array(z.number()),
});

const rangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const bboxSchema = z.object({
  x: rangeSchema,
  y: rangeSchema,
});

export type Cluster = z.infer<typeof clusterSchema>;
export type ClusterInput = z.infer<typeof clusterInputSchema>;
export type BBox = z.infer<typeof bboxSchema>;
export type ClusterMatch = Cluster & { score: number };

export type ClusterRepository = {
  createSchema(): Promise<void>;
  upsert(items: ClusterInput[]): Promise<void>;
  findById(id: string): Promise<Cluster | null>;
  findByIds(ids: string[]): Promise<Cluster[]>;
  findInViewport(args: { bbox: BBox; limit: number }): Promise<Cluster[]>;
  findByVector(args: {
    vector: number[];
    limit: number;
  }): Promise<ClusterMatch[]>;
};
