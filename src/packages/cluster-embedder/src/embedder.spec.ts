import { describe, it, expect, vi } from "vitest";
import { createClusterEmbedder } from "./embedder.js";

const createMockDeps = () => ({
  embed: vi.fn().mockResolvedValueOnce({ embedding: [0.1, 0.2, 0.3] }),
  upsert: vi.fn().mockResolvedValueOnce({ id: "42" }),
});

const createMockCluster = () => ({
  id: "42",
  totalArticles: 100,
  titles: ["Title A", "Title B", "Title C"],
});

describe("createClusterEmbedder", () => {
  it("should embed titles text joined by double newlines", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(createMockCluster());

    expect(deps.embed).toHaveBeenCalledWith("Title A\n\nTitle B\n\nTitle C");
    expect(deps.embed).toHaveBeenCalledTimes(1);
  });

  it("should limit titles to maxTitles option", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(createMockCluster(), { maxTitles: 2 });

    expect(deps.embed).toHaveBeenCalledWith("Title A\n\nTitle B");
    expect(deps.embed).toHaveBeenCalledTimes(1);
  });

  it("should use all titles when maxTitles is not provided", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);
    const cluster = {
      id: "1",
      totalArticles: 50,
      titles: Array.from({ length: 20 }, (_, i) => `Title ${i + 1}`),
    };

    await embedCluster(cluster);

    const expectedText = cluster.titles.join("\n\n");
    expect(deps.embed).toHaveBeenCalledWith(expectedText);
    expect(deps.embed).toHaveBeenCalledTimes(1);
  });

  it("should upsert with vectors and metadata", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(createMockCluster());

    expect(deps.upsert).toHaveBeenCalledWith({
      id: "42",
      vectors: {
        titles: [0.1, 0.2, 0.3],
      },
      metadata: {
        clusterId: "42",
        totalArticles: 100,
        embedding: {
          titlesCount: 3,
        },
      },
    });
    expect(deps.upsert).toHaveBeenCalledTimes(1);
  });

  it("should return id from upsert result", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    const result = await embedCluster(createMockCluster());

    expect(result).toEqual({ id: "42" });
  });
});
