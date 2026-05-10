import { describe, expect, it } from "vitest";
import { parseSort, serializeSort } from "./filter.ts";

describe("sort filter", () => {
  it("should parse the sort URL value into a typed sort", () => {
    expect(parseSort({ sort: "articlesCount.desc" })).toEqual({
      kind: "articlesCount",
      direction: "desc",
    });
  });

  it.each([{}, { sort: "garbage" }, { sort: 7 }])(
    "should fall back to relevance when the URL slice is %j",
    (params) => {
      expect(parseSort(params)).toEqual({ kind: "relevance" });
    },
  );

  it("should serialize a non-default sort into the URL slice", () => {
    expect(serializeSort({ kind: "articlesCount", direction: "desc" })).toEqual(
      { sort: "articlesCount.desc" },
    );
  });

  it("should omit sort from the URL when at default (relevance)", () => {
    expect(serializeSort({ kind: "relevance" })).toEqual({
      sort: undefined,
    });
  });
});
