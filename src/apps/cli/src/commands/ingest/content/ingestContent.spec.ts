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

const buildDeps = (
  { collectionExists }: { collectionExists: boolean } = {
    collectionExists: false,
  },
) => {
  const createSchema = collectionExists
    ? vi.fn().mockRejectedValueOnce(new Error("Collection already exists"))
    : vi.fn().mockResolvedValueOnce(undefined);
  const contentRepo = {
    createSchema,
    upsert: vi.fn().mockResolvedValueOnce(undefined),
    findByClusterId: vi.fn(),
  } satisfies AtlasStore["content"];
  return {
    contentRepo,
    readContent: vi.fn().mockResolvedValueOnce([youtubeRow]),
  };
};

describe("ingestContent", () => {
  it("should create schema and upsert built items", async () => {
    const deps = buildDeps();
    const result = await ingestContent(deps);

    expect(deps.contentRepo.createSchema).toHaveBeenCalledTimes(1);
    expect(deps.contentRepo.upsert).toHaveBeenCalledTimes(1);
    expect(deps.contentRepo.upsert.mock.calls[0][0]).toHaveLength(1);
    expect(result).toEqual({ count: 1 });
  });

  it("should abort when createSchema rejects (collection already exists)", async () => {
    const deps = buildDeps({ collectionExists: true });
    await expect(ingestContent(deps)).rejects.toThrow(/already exists/);
    expect(deps.contentRepo.upsert).not.toHaveBeenCalled();
  });
});
