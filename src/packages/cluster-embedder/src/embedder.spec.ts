import { describe, it, expect, vi } from "vitest";
import { createClusterEmbedder } from "./embedder.js";

const createMockDeps = () => ({
  fetchWorks: vi.fn().mockResolvedValueOnce([
    {
      doi: "https://doi.org/10.1234/a",
      title: "Title A",
      abstract: "Abstract A",
    },
    { doi: "https://doi.org/10.1234/b", title: "Title B", abstract: null },
  ]),
  embed: vi
    .fn()
    .mockResolvedValueOnce({ embedding: [0.1, 0.2] })
    .mockResolvedValueOnce({ embedding: [0.3, 0.4] }),
  upsert: vi.fn().mockResolvedValueOnce({ id: "cluster-1" }),
});

const createMockCluster = () => ({
  id: "cluster-1",
  researchFields: "Physics",
  researchSubfields: "Quantum",
  keyConcepts: "quantum computing, qubits",
  articleCount: 100,
  articleAge: 5,
  growthRating: 80,
  articles: [
    { doi: "https://doi.org/10.1234/a", title: "Title A" },
    { doi: "https://doi.org/10.1234/b", title: "Title B" },
    { doi: "https://doi.org/10.1234/a", title: "Title A Duplicate" },
    { doi: "invalid-doi", title: "Invalid" },
  ],
});

describe("createClusterEmbedder", () => {
  it("should fetch works with deduplicated valid DOIs", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(createMockCluster());

    expect(deps.fetchWorks).toHaveBeenCalledWith([
      "https://doi.org/10.1234/a",
      "https://doi.org/10.1234/b",
    ]);
    expect(deps.fetchWorks).toHaveBeenCalledTimes(1);
  });

  it("should limit DOIs to maxArticles option", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(createMockCluster(), { maxArticles: 1 });

    expect(deps.fetchWorks).toHaveBeenCalledWith(["https://doi.org/10.1234/a"]);
    expect(deps.fetchWorks).toHaveBeenCalledTimes(1);
  });

  it("should embed concepts and articles text", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(createMockCluster());

    expect(deps.embed).toHaveBeenNthCalledWith(1, "quantum computing, qubits");
    expect(deps.embed).toHaveBeenNthCalledWith(
      2,
      "Title A\n\nAbstract A\n\n\nTitle B",
    );
    expect(deps.embed).toHaveBeenCalledTimes(2);
  });

  it("should upsert with vectors and metadata", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(createMockCluster());

    expect(deps.upsert).toHaveBeenCalledWith({
      id: "cluster-1",
      vectors: {
        concepts: [0.1, 0.2],
        articles: [0.3, 0.4],
      },
      metadata: {
        keyConcepts: "quantum computing, qubits",
        articleCount: 100,
        growthRating: 80,
      },
    });
    expect(deps.upsert).toHaveBeenCalledTimes(1);
  });
});
