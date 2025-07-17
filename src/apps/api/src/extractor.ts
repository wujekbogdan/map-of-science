import { readFileSync } from "node:fs";
import { z as zod } from "zod";
import {
  parse,
  createProcessor,
  arrayCollector,
  mapCollector,
} from "@map-of-science/csv";
import { config } from "./config.js";

const EmbeddingResponseSchema = zod.object({
  data: zod.array(
    zod.object({
      object: zod.literal("embedding"),
      embedding: zod.array(zod.number()),
      index: zod.number(),
    }),
  ),
  id: zod.string(),
});

export const ConceptSchema = (z: typeof zod) =>
  z
    .object({
      index: z.coerce.number(),
      key: z.string(),
    })
    .transform((concept) => ({
      id: concept.index,
      concept: concept.key,
    }));
export type Concept = zod.infer<ReturnType<typeof ConceptSchema>>;

export const MakeClustersSchema =
  (concepts: Map<number, Concept>) => (z: typeof zod) =>
    z
      .object({
        cluster_id: z.coerce.number(),
        x: z.coerce.number(),
        y: z.coerce.number(),
        num_recent_articles: z.coerce.number(),
        cluster_category: z.coerce.number(),
        growth_rating: z.coerce.number().min(0).max(100),
        key_concepts: z.string(),
      })
      .transform((data) => ({
        clusterId: data.cluster_id,
        concepts: data.key_concepts
          .split(",")
          .map((id) => concepts.get(Number(id)))
          .filter((id) => id !== undefined),
      }));

type ClustersSchema = ReturnType<typeof MakeClustersSchema>;
export type Cluster = zod.infer<ReturnType<ClustersSchema>>;

type Paths = {
  clusters: string;
  concepts: string;
};

export const concepts = async (path: string) => {
  const conceptsProcessor = createProcessor(
    ConceptSchema(zod),
    mapCollector(({ id }) => id),
  );

  await parse(() => readFileSync(path).toString(), conceptsProcessor.process);

  return conceptsProcessor.getResults();
};

export const clusters = async (paths: Paths) => {
  const clustersProcessor = createProcessor(
    MakeClustersSchema(await concepts(paths.concepts))(zod),
    arrayCollector(),
  );

  await parse(
    () => readFileSync(paths.clusters).toString(),
    clustersProcessor.process,
  );

  return clustersProcessor.getResults();
};

export const Extractor = () => {
  const baseUrl = `http://${config.embeddings.host}:${config.embeddings.port}`;

  return {
    extract: async (text: string[] | string) => {
      const input = Array.isArray(text) ? text : [text];
      const response = await fetch(`${baseUrl}/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error(`Embedding service error: ${response.status}`);
      }

      const json = await response.json();
      return EmbeddingResponseSchema.parse(json);
    },
  };
};

export async function extract(cluster: Cluster[]) {
  const extractor = Extractor();

  const { data } = await extractor.extract(
    cluster.map(({ concepts }) =>
      concepts.map(({ concept }) => concept).join(", "),
    ),
  );

  return cluster.map(({ clusterId, concepts }, index) => ({
    clusterId,
    concepts: concepts.map(({ id }) => id),
    embeddings: data[index].embedding,
  }));
}
