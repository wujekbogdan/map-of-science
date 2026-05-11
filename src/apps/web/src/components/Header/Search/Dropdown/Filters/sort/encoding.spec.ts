import { describe, expect, it } from "vitest";
import { decodeSort, encodeSort } from "./encoding.ts";

describe("sort encoding", () => {
  it("should round-trip the relevance value", () => {
    const value = { kind: "relevance" } as const;
    expect(decodeSort(encodeSort(value))).toEqual(value);
  });

  it.each([{ direction: "asc" } as const, { direction: "desc" } as const])(
    "should round-trip articlesCount with direction $direction",
    ({ direction }) => {
      const value = { kind: "articlesCount", direction } as const;
      expect(decodeSort(encodeSort(value))).toEqual(value);
    },
  );

  it.each([
    "",
    "unknownKind",
    "articlesCount",
    "articlesCount.sideways",
    "relevance.asc",
    null,
    42,
    { kind: "relevance" },
  ])("should return undefined for malformed input %j", (raw) => {
    expect(decodeSort(raw)).toBeUndefined();
  });
});
