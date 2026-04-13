import { describe, expect, it } from "vitest";
import { areaSchema } from "./areas.js";

const validArea = {
  id: "area-1",
  externalId: "550e8400-e29b-41d4-a716-446655440000",
  position: { x: 100, y: -200 },
  tier: 2,
  name: { en_US: "Physics", pl_PL: "Fizyka" },
};

describe("areaSchema", () => {
  it("should accept a valid area", () => {
    expect(areaSchema.parse(validArea)).toEqual(validArea);
  });

  it("should reject non-integer tier", () => {
    expect(() => areaSchema.parse({ ...validArea, tier: 1.5 })).toThrow();
  });

  it("should require both locales on name", () => {
    expect(() =>
      areaSchema.parse({ ...validArea, name: { en_US: "Physics" } }),
    ).toThrow();
  });
});
