import type { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { ingestContent } from "./ingestContent.js";

const youtubeRow = {
  video_id: "abc",
  video_title: "V",
  date: "2025-05-26T08:00:00Z",
  segment_number: "1)",
  segment_timestamp: "00:10",
  segment_url: "https://www.youtube.com/watch?v=abc&t=10s",
  segment_topic: "t",
  reference: "",
  article_link: "",
  segment_name: "S",
  doi: "",
  open_alex_id: "",
  classification: "area-1",
};

const buildDeps = (exists = false) => {
  const contentRepo = {
    ensureSchema: vi.fn().mockResolvedValueOnce(undefined),
    upsert: vi.fn().mockResolvedValueOnce(undefined),
    findByClusterId: vi.fn(),
  } satisfies AtlasStore["content"];
  const qdrant = {
    collectionExists: vi.fn().mockResolvedValueOnce({ exists }),
  } as Pick<QdrantClient, "collectionExists">;
  return {
    qdrant: qdrant as QdrantClient,
    contentRepo,
    readContent: vi.fn().mockResolvedValueOnce([youtubeRow]),
  };
};

describe("ingestContent", () => {
  it("should pre-check the collection, ensure schema, and upsert built items", async () => {
    const deps = buildDeps();
    const result = await ingestContent(deps);

    expect(deps.contentRepo.ensureSchema).toHaveBeenCalledTimes(1);
    expect(deps.contentRepo.upsert).toHaveBeenCalledTimes(1);
    expect(deps.contentRepo.upsert.mock.calls[0][0]).toHaveLength(1);
    expect(result).toEqual({ count: 1 });
  });

  it("should abort when the content collection already exists", async () => {
    const deps = buildDeps(true);
    await expect(ingestContent(deps)).rejects.toThrow(/already exists/);
    expect(deps.contentRepo.ensureSchema).not.toHaveBeenCalled();
    expect(deps.contentRepo.upsert).not.toHaveBeenCalled();
  });
});
