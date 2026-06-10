import { QdrantClient } from "@qdrant/js-client-rest";
import { writeFile } from "node:fs/promises";
import { dir as tmpDir } from "tmp-promise";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { withQdrantContainer } from "@map-of-science/test-utils";
import { toTsv } from "../../../__test__/tsv.js";
import { runIngestClusters } from "./command.js";

const clustersTsv = toTsv([
  [
    "cluster_id",
    "x",
    "y",
    "num_recent_articles",
    "cluster_category",
    "growth_rating",
    "key_concepts",
  ],
  [1, 10.5, -5.25, 1000, 5, 42.5, "1,2,3"],
  [2, 200, 300, 500, 3, 15, "4,5,6"],
]);

const namesTsv = toTsv([
  ["cluster_id", "en-US", "pl-PL"],
  [1, "Quantum computing", "Obliczenia kwantowe"],
]);

const placesTsv = toTsv([["id", "cluster_id"]]);
const entitiesTsv = toTsv([["id", "en-US", "pl-PL"]]);

const etoNdjson =
  JSON.stringify({
    id: 1,
    totalArticles: 1000,
    articles: {
      core: [
        { title: "Quantum entanglement measurements" },
        { title: "Superconducting qubits" },
      ],
      review: [{ title: "Review of quantum computing hardware" }],
      highlyCited: [{ title: "Quantum supremacy demonstration" }],
    },
  }) +
  "\n" +
  JSON.stringify({
    id: 2,
    totalArticles: 500,
    articles: {
      core: [{ title: "Transformer architectures for language models" }],
      review: [{ title: "Survey of deep learning techniques" }],
      highlyCited: [{ title: "Attention is all you need" }],
    },
  }) +
  "\n";

type Fixtures = {
  etoInput: string;
  clusters: string;
  names: string;
  places: string;
  entities: string;
};

const withFixtures = async (test: (fixtures: Fixtures) => Promise<void>) => {
  const dir = await tmpDir({ unsafeCleanup: true });
  try {
    const etoInput = `${dir.path}/eto.ndjson`;
    const clusters = `${dir.path}/clusters.tsv`;
    const names = `${dir.path}/names.tsv`;
    const places = `${dir.path}/places.tsv`;
    const entities = `${dir.path}/entities.tsv`;
    await Promise.all([
      writeFile(etoInput, etoNdjson),
      writeFile(clusters, clustersTsv),
      writeFile(names, namesTsv),
      writeFile(places, placesTsv),
      writeFile(entities, entitiesTsv),
    ]);
    expect.hasAssertions();
    await test({ etoInput, clusters, names, places, entities });
  } finally {
    await dir.cleanup();
  }
};

describe("ingest:clusters e2e", () => {
  beforeAll(() => {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is required for this test");
    }
  });

  it(
    "should ingest clusters with embeddings from Gemini",
    withQdrantContainer(async (qdrant) => {
      vi.stubEnv("QDRANT_URL", qdrant.url);
      vi.stubEnv("QDRANT_API_KEY", "");
      vi.stubEnv("GOOGLE_API_KEY", process.env.GOOGLE_API_KEY);

      await withFixtures(async (fixtures) => {
        await runIngestClusters({
          etoInput: fixtures.etoInput,
          clusters: fixtures.clusters,
          names: fixtures.names,
          places: fixtures.places,
          entities: fixtures.entities,
          batchSize: 10,
        });

        const client = new QdrantClient({ url: qdrant.url });
        const { count } = await client.count("clusters", { exact: true });
        expect(count).toBe(2);

        const { points } = await client.scroll("clusters", {
          limit: 10,
          with_payload: true,
          with_vector: true,
        });
        const byExternalId = new Map(
          points.map((p) => [
            (p.payload as { externalId: number }).externalId,
            p,
          ]),
        );
        const cluster1 = byExternalId.get(1);
        expect(cluster1?.payload).toMatchObject({
          externalId: 1,
          x: 10.5,
          y: -5.25,
          name: { en_US: "Quantum computing", pl_PL: "Obliczenia kwantowe" },
          nameSource: "llm",
          articlesCount: 1000,
          growthRating: 42.5,
        });
        const vector = (cluster1?.vector as Record<string, number[]>).titles;
        expect(vector).toHaveLength(768);
      });
    }),
    60_000,
  );
});
