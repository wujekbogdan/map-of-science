import { describe, expect, it, vi } from "vitest";
import { createAreasRepository } from "./areas/areas.js";
import { createClustersRepository } from "./clusters/clusters.js";
import { createContentRepository } from "./content/content.js";
import { createAtlasStore } from "./createAtlasStore.js";

const { clusterEnsure, areasEnsure, contentEnsure } = vi.hoisted(() => ({
  clusterEnsure: vi.fn(),
  areasEnsure: vi.fn(),
  contentEnsure: vi.fn(),
}));

vi.mock("./clusters/clusters.js", () => ({
  createClustersRepository: vi.fn(() => ({ ensureSchema: clusterEnsure })),
}));

vi.mock("./areas/areas.js", () => ({
  createAreasRepository: vi.fn(() => ({ ensureSchema: areasEnsure })),
}));

vi.mock("./content/content.js", () => ({
  createContentRepository: vi.fn(() => ({ ensureSchema: contentEnsure })),
}));

describe("createAtlasStore", () => {
  it("should pass the same QdrantClient to all three repositories", () => {
    createAtlasStore({ url: "http://localhost:6333" });

    const clustersCall = vi.mocked(createClustersRepository).mock.calls[0][0];
    const areasCall = vi.mocked(createAreasRepository).mock.calls[0][0];
    const contentCall = vi.mocked(createContentRepository).mock.calls[0][0];

    expect(clustersCall.qdrant).toBe(areasCall.qdrant);
    expect(areasCall.qdrant).toBe(contentCall.qdrant);
  });

  it("should call ensureSchema on all three repositories when ensureSchemas is called", async () => {
    const store = createAtlasStore({ url: "http://localhost:6333" });

    await store.ensureSchemas();

    expect(clusterEnsure).toHaveBeenCalledTimes(1);
    expect(areasEnsure).toHaveBeenCalledTimes(1);
    expect(contentEnsure).toHaveBeenCalledTimes(1);
  });
});
