import { describe, it, expect, vi } from "vitest";
import { createClusterEmbedder } from "./embedder.js";

const createMockDeps = () => ({
  embed: vi.fn().mockResolvedValueOnce({ embedding: [0.1, 0.2, 0.3] }),
});

describe("createClusterEmbedder", () => {
  it("should embed titles text joined by double newlines", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster({ titles: ["Title A", "Title B", "Title C"] });

    expect(deps.embed).toHaveBeenCalledTimes(1);
    expect(deps.embed).toHaveBeenNthCalledWith(
      1,
      "Title A\n\nTitle B\n\nTitle C",
    );
  });

  it("should return the embedding vector", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    const result = await embedCluster({
      titles: ["Title A", "Title B", "Title C"],
    });

    expect(result).toEqual({ vector: [0.1, 0.2, 0.3] });
  });

  it("should limit titles to maxTitles option", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);

    await embedCluster(
      { titles: ["Title A", "Title B", "Title C"] },
      { maxTitles: 2 },
    );

    expect(deps.embed).toHaveBeenCalledTimes(1);
    expect(deps.embed).toHaveBeenNthCalledWith(1, "Title A\n\nTitle B");
  });

  it("should use all titles when maxTitles is not provided", async () => {
    const deps = createMockDeps();
    const embedCluster = createClusterEmbedder(deps);
    const titles = Array.from({ length: 20 }, (_, i) => `Title ${i + 1}`);

    await embedCluster({ titles });

    expect(deps.embed).toHaveBeenCalledTimes(1);
    expect(deps.embed).toHaveBeenNthCalledWith(1, titles.join("\n\n"));
  });
});
