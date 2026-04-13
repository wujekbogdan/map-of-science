import { describe, expect, it } from "vitest";
import { contentItemSchema } from "./content.js";

const validYoutube = {
  id: "content-1",
  type: "youtube-segment" as const,
  title: "Intro to Quantum Computing",
  url: "https://www.youtube.com/watch?v=abc123&t=42s",
  metadata: {
    videoId: "abc123",
    segmentUrl: "https://www.youtube.com/watch?v=abc123&t=42s",
    segmentName: "Qubits explained",
    date: "2026-01-15",
  },
  entityRefs: [
    { type: "cluster" as const, id: "cluster-1" },
    { type: "area" as const, id: "area-2" },
  ],
};

describe("contentItemSchema", () => {
  it("should accept a youtube-segment content item", () => {
    expect(contentItemSchema.parse(validYoutube)).toEqual(validYoutube);
  });

  it("should reject unknown content types", () => {
    expect(() =>
      contentItemSchema.parse({ ...validYoutube, type: "blog-post" }),
    ).toThrow();
  });

  it("should reject invalid url in metadata", () => {
    expect(() =>
      contentItemSchema.parse({
        ...validYoutube,
        metadata: { ...validYoutube.metadata, segmentUrl: "not-a-url" },
      }),
    ).toThrow();
  });

  it("should reject entityRef with unknown type", () => {
    expect(() =>
      contentItemSchema.parse({
        ...validYoutube,
        entityRefs: [{ type: "planet", id: "x" }],
      }),
    ).toThrow();
  });
});
