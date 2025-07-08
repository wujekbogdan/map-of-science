import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { parse } from "./qdrant.js";

const resolvePath = (relativePath: string) => {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, relativePath);
};

describe("qdrant", () => {
  it("should parse the tsv", async () => {
    const parsed = [];

    for await (const item of parse(
      resolvePath("__fixtures__/embeddings.tsv"),
      1,
    )) {
      parsed.push(item[0]);
    }

    expect(parsed).toMatchObject([
      {
        clusterId: 84872,
        concepts: expect.any(Array) as [],
        embeddings: expect.any(Array) as [],
      },
      {
        clusterId: 72062,
        concepts: expect.any(Array) as [],
        embeddings: expect.any(Array) as [],
      },
    ]);

    expect(parsed[0].embeddings).toHaveLength(384);
    expect(parsed[1].embeddings).toHaveLength(384);
  });
});
