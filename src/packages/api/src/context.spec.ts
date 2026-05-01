import { describe, expect, it } from "vitest";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { createContext } from "./context.js";

const atlas = {} as AtlasStore;
const search = {} as Search;

const langFor = (xLang?: string) =>
  createContext({
    req: { headers: { "x-lang": xLang } },
    atlas,
    search,
  }).lang;

describe("createContext language resolution", () => {
  it.each([
    ["en_US", "en_US"],
    ["pl_PL", "pl_PL"],
  ] as const)("should accept the supported lang %s", (header, expected) => {
    expect(langFor(header)).toBe(expected);
  });

  it("should default to en_US when no x-lang header is set", () => {
    expect(langFor(undefined)).toBe("en_US");
  });

  it.each(["en-US", "pl", "de_DE", "garbage", ""])(
    "should default to en_US for unsupported value %j",
    (header) => {
      expect(langFor(header)).toBe("en_US");
    },
  );
});
