import { describe, expect, it, vi } from "vitest";
import { createSearch } from "./createSearch.js";
import { metadataSearch } from "./metadataSearch.js";
import { multiVectorSearch } from "./multiVectorSearch.js";
import { singleVectorSearch } from "./singleVectorSearch.js";
import type { MultiVectorQuery } from "./types.js";

vi.mock("./singleVectorSearch.js", () => ({
  singleVectorSearch: vi.fn(),
}));

vi.mock("./multiVectorSearch.js", () => ({
  multiVectorSearch: vi.fn(),
}));

vi.mock("./metadataSearch.js", () => ({
  metadataSearch: vi.fn(),
}));

const mockClient = {} as Parameters<typeof createSearch>[0]["client"];
const mockResult = { items: [], nextOffset: null };

describe("createSearch", () => {
  it("routes single query to singleVectorSearch", async () => {
    vi.mocked(singleVectorSearch).mockResolvedValueOnce(mockResult);
    const search = createSearch({ client: mockClient, collectionName: "test" });

    await search({
      query: { type: "single", using: "articles", vector: [1, 2, 3] },
      limit: 5,
    });

    expect(singleVectorSearch).toHaveBeenCalledTimes(1);
    expect(singleVectorSearch).toHaveBeenCalledWith(
      {
        query: { type: "single", using: "articles", vector: [1, 2, 3] },
        filter: undefined,
        limit: 5,
        offset: 0,
      },
      { client: mockClient, collectionName: "test" },
    );
  });

  it("routes multi query to multiVectorSearch", async () => {
    vi.mocked(multiVectorSearch).mockResolvedValueOnce(mockResult);
    const search = createSearch({ client: mockClient, collectionName: "test" });

    await search({
      query: {
        type: "multi",
        prefetch: [
          { vector: [1], using: "a", limit: 20 },
          { vector: [2], using: "b", limit: 20 },
        ],
        fusion: { type: "rrf" },
      },
      limit: 10,
    });

    expect(multiVectorSearch).toHaveBeenCalledTimes(1);
    expect(multiVectorSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          type: "multi",
        }) as unknown as MultiVectorQuery,
        limit: 10,
        offset: 0,
      }),
      { client: mockClient, collectionName: "test" },
    );
  });

  it("routes no query to metadataSearch", async () => {
    vi.mocked(metadataSearch).mockResolvedValueOnce(mockResult);
    const search = createSearch({ client: mockClient, collectionName: "test" });

    await search({
      filter: [{ key: "type", match: "article" }],
      limit: 5,
    });

    expect(metadataSearch).toHaveBeenCalledTimes(1);
    expect(metadataSearch).toHaveBeenCalledWith(
      {
        filter: [{ key: "type", match: "article" }],
        limit: 5,
        offset: undefined,
        orderBy: undefined,
      },
      { client: mockClient, collectionName: "test" },
    );
  });

  it("uses default limit of 10", async () => {
    vi.mocked(singleVectorSearch).mockResolvedValueOnce(mockResult);
    const search = createSearch({ client: mockClient, collectionName: "test" });

    await search({
      query: { type: "single", using: "articles", vector: [1] },
    });

    expect(singleVectorSearch).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10 }),
      expect.any(Object),
    );
  });
});
