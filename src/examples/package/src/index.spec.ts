import { describe, it, expect } from "vitest";
import { greet } from "./index.js";

describe("greet", () => {
  it("should return greeting message", () => {
    expect(greet("World")).toBe("Hello, World!");
  });
});
