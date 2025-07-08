import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { clusters, extract } from "./index.js";

const resolvePath = (relativePath: string) => {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, relativePath);
};

describe("API", () => {
  it("should prepare the data", async () => {
    expect(
      await clusters({
        clusters: resolvePath("./__fixtures__/clusters.tsv"),
        concepts: resolvePath("./__fixtures__/concepts.tsv"),
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
    const clustersWithEmbeddings = await extract([
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
    ]);

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
