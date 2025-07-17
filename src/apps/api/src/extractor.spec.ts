import { getPort } from "get-port-please";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GenericContainer, Wait, StartedTestContainer } from "testcontainers";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { config } from "./config.js";
import { clusters, extract } from "./extractor.js";

describe("extractor", () => {
  let container: StartedTestContainer | undefined;
  let port: number;

  beforeAll(async () => {
    port = await getPort({
      random: true,
    });
    console.log(`Starting container on port ${port}`);
    container = await new GenericContainer("michaelf34/infinity:0.0.75")
      .withExposedPorts({ container: 7997, host: port })
      .withEnvironment({
        INFINITY_MODEL_ID: "sentence-transformers/all-MiniLM-L6-v2",
      })
      .withWaitStrategy(Wait.forLogMessage("Application startup complete"))
      .start();

    vi.spyOn(config.embeddings, "port", "get").mockReturnValue(port);
  }, 60_000);

  afterAll(async () => {
    await container?.stop();
  });

  it("should prepare the data", async () => {
    const here = dirname(fileURLToPath(import.meta.url));
    expect(
      await clusters({
        clusters: resolve(here, "./__fixtures__/clusters.tsv"),
        concepts: resolve(here, "./__fixtures__/concepts.tsv"),
      }),
    ).toEqual([
      {
        clusterId: 84872,
        concepts: [
          { concept: "zero", id: 0 },
          { concept: "one", id: 1 },
        ],
      },
      {
        clusterId: 72062,
        concepts: [{ concept: "five", id: 5 }],
      },
      {
        clusterId: 62380,
        concepts: [
          { concept: "ten", id: 10 },
          { concept: "nine", id: 9 },
        ],
      },
    ]);
  });

  it("should extract embeddings", async () => {
    const clusters = [
      {
        clusterId: 84872,
        concepts: [
          { concept: "zero", id: 0 },
          { concept: "one", id: 1 },
        ],
      },
      {
        clusterId: 72062,
        concepts: [{ concept: "five", id: 5 }],
      },
    ];
    const clustersWithEmbeddings = await extract(clusters);
    expect(clustersWithEmbeddings).toMatchObject([
      {
        clusterId: 84872,
        concepts: [0, 1],
        embeddings: expect.any(Array) as [],
      },
      {
        clusterId: 72062,
        concepts: [5],
        embeddings: expect.any(Array) as [],
      },
    ]);

    expect(clustersWithEmbeddings[0].embeddings).toHaveLength(384);
    expect(clustersWithEmbeddings[1].embeddings).toHaveLength(384);
  });
});
