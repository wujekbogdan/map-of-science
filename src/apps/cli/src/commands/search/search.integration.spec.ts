import { writeFile } from "node:fs/promises";
import { dir as tmpDir } from "tmp-promise";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { withQdrantContainer } from "@map-of-science/test-utils";
import { toTsv } from "../../__test__/tsv.js";
import { runIngestClusters } from "../ingest/clusters/command.js";
import { search } from "./search.js";

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
  [1, 10, -5, 1000, 5, 42, "1,2,3"],
  [2, 200, 300, 500, 3, 15, "4,5,6"],
]);

const namesTsv = toTsv([["cluster_id", "en-US", "pl-PL"]]);
const placesTsv = toTsv([["id", "cluster_id"]]);
const entitiesTsv = toTsv([["id", "en-US", "pl-PL"]]);

const etoNdjson =
  JSON.stringify({
    id: 1,
    totalArticles: 1000,
    articles: {
      core: ["Quantum entanglement measurements", "Superconducting qubits"],
      review: ["Review of quantum computing hardware"],
      highlyCited: ["Quantum supremacy demonstration"],
    },
  }) +
  "\n" +
  JSON.stringify({
    id: 2,
    totalArticles: 500,
    articles: {
      core: ["Transformer architectures for language models"],
      review: ["Survey of deep learning techniques"],
      highlyCited: ["Attention is all you need"],
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

describe("search e2e", () => {
  beforeAll(() => {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is required for this test");
    }
  });

  it(
    "should return the closest cluster for a semantic query",
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

        const quantum = await search("quantum computing", { limit: "2" });
        expect(quantum.results[0]?.externalId).toBe(1);

        const transformer = await search("deep learning transformer models", {
          limit: "2",
        });
        expect(transformer.results[0]?.externalId).toBe(2);
      });
    }),
    60_000,
  );
});
