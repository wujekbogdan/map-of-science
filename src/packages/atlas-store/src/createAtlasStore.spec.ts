import type { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
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

const qdrant = {} as QdrantClient;

describe("createAtlasStore", () => {
  it("should call ensureSchema on all three repositories when ensureSchemas is called", async () => {
    const store = createAtlasStore({ qdrant });

    await store.ensureSchemas();

    expect(clusterEnsure).toHaveBeenCalledTimes(1);
    expect(areasEnsure).toHaveBeenCalledTimes(1);
    expect(contentEnsure).toHaveBeenCalledTimes(1);
  });
});
