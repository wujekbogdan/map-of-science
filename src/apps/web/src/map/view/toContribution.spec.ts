import { describe, expect, it } from "vitest";
import { toContribution } from "./toContribution.ts";

describe("toContribution", () => {
  it("should report how far a left-docked panel reaches into the map", () => {
    const contribution = toContribution({
      panelRect: { left: 0, top: 0, right: 460, bottom: 600 },
      mapRect: { left: 0, top: 0, right: 1024, bottom: 768 },
      edge: "left",
    });

    expect(contribution).toEqual({ left: 460 });
  });

  it("should report coverage relative to the map's left edge when the map is offset from the viewport", () => {
    const contribution = toContribution({
      panelRect: { left: 100, top: 0, right: 560, bottom: 600 },
      mapRect: { left: 100, top: 0, right: 1124, bottom: 768 },
      edge: "left",
    });

    expect(contribution).toEqual({ left: 460 });
  });

  it("should report how far a top-docked panel reaches into the map", () => {
    const contribution = toContribution({
      panelRect: { left: 0, top: 0, right: 1024, bottom: 60 },
      mapRect: { left: 0, top: 0, right: 1024, bottom: 768 },
      edge: "top",
    });

    expect(contribution).toEqual({ top: 60 });
  });

  it("should report zero when the panel sits outside the map's left edge", () => {
    const contribution = toContribution({
      panelRect: { left: 0, top: 0, right: 200, bottom: 600 },
      mapRect: { left: 300, top: 0, right: 1324, bottom: 768 },
      edge: "left",
    });

    expect(contribution).toEqual({ left: 0 });
  });
});
