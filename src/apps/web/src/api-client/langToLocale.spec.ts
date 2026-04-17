import { describe, it, expect } from "vitest";
import { langToLocale } from "./langToLocale.ts";

describe("langToLocale", () => {
  it("should map 'en' to 'en-US'", () => {
    expect(langToLocale("en")).toBe("en-US");
  });

  it("should map 'pl' to 'pl-PL'", () => {
    expect(langToLocale("pl")).toBe("pl-PL");
  });
});
