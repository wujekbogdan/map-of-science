import { pipeline } from "@huggingface/transformers";
import { readFileSync } from "node:fs";
import { z as zod } from "zod";
import {
  parse,
  createProcessor,
  arrayCollector,
  mapCollector,
} from "@map-of-science/csv";

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

export const Extractor = async () => {
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    {
      dtype: "fp32",
      cache_dir: `${import.meta.dirname}/../.cache`,
    },
  );

  return {
    extract: async (text: string) => {
      const tensor = await extractor(text, {
        pooling: "mean",
        normalize: true,
      });
      const list = tensor.tolist() as number[][];
      return list[0];
    },
  };
};

export async function* extract(cluster: Cluster[]) {
  const extractor = await Extractor();

  for (const { clusterId, concepts } of cluster) {
    const commaSeparatedConcepts = concepts
      .map(({ concept }) => concept)
      .join(", ");
    const embeddings = await extractor.extract(commaSeparatedConcepts);

    yield {
      clusterId,
      concepts: concepts.map(({ id }) => id),
      embeddings,
    };
  }
}
