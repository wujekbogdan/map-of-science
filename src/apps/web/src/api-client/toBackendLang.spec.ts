import { describe, expect, it } from "vitest";
import { toBackendLang } from "./toBackendLang.ts";

describe("toBackendLang", () => {
  it.each([
    ["en", "en_US"],
    ["pl", "pl_PL"],
  ] as const)("should map %s to %s", (input, expected) => {
    expect(toBackendLang(input)).toBe(expected);
  });
});
