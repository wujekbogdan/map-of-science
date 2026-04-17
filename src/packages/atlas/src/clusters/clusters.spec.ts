import { describe, expect, it } from "vitest";
import { clusterInputSchema, clusterSchema } from "./clusters.js";

const validCluster = {
  id: "cluster-1",
  externalId: 42,
  position: { x: 10, y: -5 },
  name: { en_US: "Machine Learning", pl_PL: "Uczenie Maszynowe" },
  nameSource: "llm" as const,
  articlesCount: 1200,
  growthRating: 75.5,
  embedding: { model: "gemini-embedding-001", source: "article-titles" },
  keyConcepts: ["machine learning", "neural networks", "deep learning"],
};

describe("clusterSchema", () => {
  it("should accept a fully populated cluster", () => {
    expect(clusterSchema.parse(validCluster)).toEqual(validCluster);
  });

  it("should accept null name and nameSource", () => {
    const parsed = clusterSchema.parse({
      ...validCluster,
      name: null,
      nameSource: null,
    });
    expect(parsed.name).toBeNull();
    expect(parsed.nameSource).toBeNull();
  });

  it.each(["curated", "llm"] as const)(
    "should accept nameSource %s",
    (nameSource) => {
      expect(
        clusterSchema.parse({ ...validCluster, nameSource }).nameSource,
      ).toBe(nameSource);
    },
  );

  it("should reject unknown nameSource values", () => {
    expect(() =>
      clusterSchema.parse({ ...validCluster, nameSource: "manual" }),
    ).toThrow();
  });

  it("should reject missing embedding metadata", () => {
    const withoutEmbedding = { ...validCluster, embedding: undefined };
    expect(() => clusterSchema.parse(withoutEmbedding)).toThrow();
  });

  it("should accept keyConcepts", () => {
    const parsed = clusterSchema.parse({
      ...validCluster,
      keyConcepts: ["a", "b"],
    });
    expect(parsed.keyConcepts).toEqual(["a", "b"]);
  });

  it("should default keyConcepts to empty array when omitted", () => {
    const parsed = clusterSchema.parse({
      ...validCluster,
      keyConcepts: undefined,
    });
    expect(parsed.keyConcepts).toEqual([]);
  });
});

describe("clusterInputSchema", () => {
  it("should require a vector on top of the base cluster shape", () => {
    const input = { ...validCluster, vector: [0.1, 0.2, 0.3] };
    expect(clusterInputSchema.parse(input).vector).toEqual([0.1, 0.2, 0.3]);
  });

  it("should reject missing vector", () => {
    expect(() => clusterInputSchema.parse(validCluster)).toThrow();
  });
});
