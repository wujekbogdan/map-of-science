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
    .mockResolvedValueOnce({ embedding: [0.3, 0.4] })
    .mockResolvedValueOnce({ embedding: [0.5, 0.6] }),
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

  it("should embed concepts, articles, and titles text", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(createMockCluster());

    expect(deps.embed).toHaveBeenNthCalledWith(1, "quantum computing, qubits");
    expect(deps.embed).toHaveBeenNthCalledWith(
      2,
      "Title A\n\nAbstract A\n\n\nTitle B",
    );
    expect(deps.embed).toHaveBeenNthCalledWith(3, "Title A\n\nTitle B");
    expect(deps.embed).toHaveBeenCalledTimes(3);
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
        titles: [0.5, 0.6],
      },
      metadata: {
        keyConcepts: "quantum computing, qubits",
        articleCount: 100,
        growthRating: 80,
        embedding: {
          articleCount: 2,
          abstractCount: 1,
        },
      },
    });
    expect(deps.upsert).toHaveBeenCalledTimes(1);
  });
});
