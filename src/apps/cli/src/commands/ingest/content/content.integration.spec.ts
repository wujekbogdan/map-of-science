import { QdrantClient } from "@qdrant/js-client-rest";
import { writeFile } from "node:fs/promises";
import { dir as tmpDir } from "tmp-promise";
import { describe, expect, it, vi } from "vitest";
import { withQdrantContainer } from "@map-of-science/test-utils";
import { toTsv } from "../../../__test__/tsv.js";
import { runIngestContent } from "./command.js";

const AREA_1 = "550e8400-e29b-41d4-a716-446655441001";
const AREA_2 = "550e8400-e29b-41d4-a716-446655441002";

const youtubeTsv = toTsv([
  [
    "video_id",
    "video_title",
    "date",
    "segment_number",
    "segment_timestamp",
    "segment_url",
    "segment_topic",
    "reference",
    "article_link",
    "segment_name",
    "doi",
    "open_alex_id",
    "classification",
  ],
  [
    "vid-1",
    "Video one",
    "2025-05-26T08:00:00Z",
    "1)",
    "05:27",
    "https://www.youtube.com/watch?v=vid-1&t=327s",
    "topic",
    "",
    "",
    "Super material",
    "",
    "",
    `${AREA_1}|${AREA_2}`,
  ],
  [
    "vid-2",
    "Video two",
    "2025-06-01T08:00:00Z",
    "1)",
    "00:10",
    "https://www.youtube.com/watch?v=vid-2&t=10s",
    "topic",
    "",
    "",
    "Another topic",
    "",
    "",
    AREA_1,
  ],
]);

type Fixtures = { input: string };

const withFixtures = async (test: (fixtures: Fixtures) => Promise<void>) => {
  const dir = await tmpDir({ unsafeCleanup: true });
  try {
    const input = `${dir.path}/youtube.tsv`;
    await writeFile(input, youtubeTsv);
    expect.hasAssertions();
    await test({ input });
  } finally {
    await dir.cleanup();
  }
};

describe("ingest:content e2e", () => {
  it(
    "should ingest youtube segments into a fresh Qdrant instance",
    withQdrantContainer(async (qdrant) => {
      vi.stubEnv("QDRANT_URL", qdrant.url);
      vi.stubEnv("QDRANT_API_KEY", "");

      await withFixtures(async ({ input }) => {
        await runIngestContent({ input });

        const client = new QdrantClient({ url: qdrant.url });
        const { count } = await client.count("content_items", { exact: true });
        expect(count).toBe(2);

        const { points } = await client.scroll("content_items", {
          limit: 10,
          with_payload: true,
          with_vector: false,
        });
        const vid1 = points.find(
          (p) =>
            (p.payload as { metadata?: { videoId?: string } }).metadata
              ?.videoId === "vid-1",
        );
        expect(vid1).toMatchObject({
          payload: {
            type: "youtube-segment",
            title: "Super material",
            url: "https://www.youtube.com/watch?v=vid-1&t=327s",
            entityRefs: [
              { type: "area", id: AREA_1 },
              { type: "area", id: AREA_2 },
            ],
          },
        });
      });
    }),
  );
});
