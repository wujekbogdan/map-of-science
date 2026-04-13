import { describe, expect, it } from "vitest";
import { buildContentItems } from "./buildContentItems.js";

const youtubeRow = {
  video_id: "abc123",
  video_title: "V",
  date: "2025-05-26T08:00:00Z",
  segment_number: "1)",
  segment_timestamp: "05:27",
  segment_url: "https://www.youtube.com/watch?v=abc123&t=327s",
  segment_topic: "topic",
  reference: "",
  article_link: "",
  segment_name: "Super material",
  doi: "",
  open_alex_id: "",
  classification: "area-1|area-2",
};

describe("buildContentItems", () => {
  it("should map a youtube row to a ContentItem with area entity refs", () => {
    const items = buildContentItems([youtubeRow]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      type: "youtube-segment",
      title: "Super material",
      url: "https://www.youtube.com/watch?v=abc123&t=327s",
      metadata: {
        videoId: "abc123",
        segmentUrl: "https://www.youtube.com/watch?v=abc123&t=327s",
        segmentName: "Super material",
        date: "2025-05-26T08:00:00Z",
      },
      entityRefs: [
        { type: "area", id: "area-1" },
        { type: "area", id: "area-2" },
      ],
    });
  });

  it("should produce deterministic ids for the same video+segment", () => {
    const [a] = buildContentItems([youtubeRow]);
    const [b] = buildContentItems([youtubeRow]);
    expect(a.id).toBe(b.id);
  });

  it("should produce different ids for different segments of the same video", () => {
    const [a] = buildContentItems([youtubeRow]);
    const [b] = buildContentItems([{ ...youtubeRow, segment_number: "2)" }]);
    expect(a.id).not.toBe(b.id);
  });

  it("should drop empty entity refs when classification is blank", () => {
    const [item] = buildContentItems([{ ...youtubeRow, classification: "" }]);
    expect(item.entityRefs).toEqual([]);
  });
});
