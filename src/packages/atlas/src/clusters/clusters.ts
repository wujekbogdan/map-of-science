import { z } from "zod";

const articleSchema = z
  .object({
    title: z.string(),
    metadata: z
      .string()
      .describe(
        'Year and journal, as "<year>: <journal>". Holds the year alone when ETO gives no journal.',
      ),
    citations: z.number(),
    doi: z.string().nullable(),
  })
  .describe("An article that ETO selects for a cluster.");

const relatedClusterSchema = z
  .object({
    externalId: z
      .number()
      .describe(
        "ETO id of the other cluster. Some of these clusters are not stored.",
      ),
    significantCitations: z
      .number()
      .describe("Citations between the two clusters, as ETO counts them."),
  })
  .describe("A citation link to another cluster.");

const clusterAttributesSchema = z
  .object({
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
      .min(0)
      .max(100)
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
    averageArticleAgeYears: z
      .number()
      .describe("Mean age of the cluster's articles, per ETO."),
    citationRating: z
      .number()
      .min(0)
      .max(100)
      .describe(
        "Percentile 0-100 showing how often other work cites the cluster vs other clusters, per ETO.",
      ),
    patentRating: z
      .number()
      .min(0)
      .max(100)
      .describe(
        "Percentile 0-100 showing how often patents cite the cluster vs other clusters, per ETO.",
      ),
    topJournals: z
      .array(z.string())
      .describe(
        "Journals that publish the cluster's articles. The most frequent journal is first.",
      ),
    topInstitutions: z
      .array(z.string())
      .describe(
        "Institutions that wrote the cluster's articles. The most frequent institution is first.",
      ),
    topCompanies: z
      .array(z.string())
      .describe(
        "Companies that wrote the cluster's articles. The most frequent company is first. Each entry ends with its country in brackets.",
      ),
    articles: z
      .object({
        core: z
          .array(articleSchema)
          .describe(
            "Articles with the strongest links to the other articles in the cluster.",
          ),
        review: z
          .array(articleSchema)
          .describe(
            "Articles that describe and systematize the work of others.",
          ),
        highlyCited: z
          .array(articleSchema)
          .describe("Articles with the most citations."),
      })
      .describe("Articles that ETO selects for the cluster."),
    relatedClusters: z
      .object({
        topCiting: z
          .array(relatedClusterSchema)
          .describe("Clusters that cite the cluster."),
        topCited: z
          .array(relatedClusterSchema)
          .describe("Clusters that the cluster cites."),
      })
      .describe("Citation links to other clusters."),
  })
  .describe("Everything that describes a cluster, without its identity.");

export const clusterSchema = clusterAttributesSchema
  .extend({
    id: z.string().describe("Unique cluster identifier."),
  })
  .describe(
    "A group of scientific articles that share a topic. Clusters are the foundation - every other entity is positioned relative to them.",
  );

export const clusterInputSchema = clusterAttributesSchema
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
    minScore: number;
  }): Promise<ClusterMatch[]>;
};
