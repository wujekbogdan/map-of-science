import { describe, it, expect } from "vitest";
import { toLangCode } from "./useLanguage.ts";

describe("toLangCode", () => {
  it("should return 'en' for 'en'", () => {
    expect(toLangCode("en")).toBe("en");
  });

  it("should return 'pl' for 'pl'", () => {
    expect(toLangCode("pl")).toBe("pl");
  });

  it("should strip the region subtag 'en-US' to 'en'", () => {
    expect(toLangCode("en-US")).toBe("en");
  });

  it("should strip the region subtag 'pl-PL' to 'pl'", () => {
    expect(toLangCode("pl-PL")).toBe("pl");
  });

  it("should fall back to 'en' for unsupported inputs", () => {
    expect(toLangCode("de")).toBe("en");
    expect(toLangCode("")).toBe("en");
    expect(toLangCode("xx-YY")).toBe("en");
  });
});
