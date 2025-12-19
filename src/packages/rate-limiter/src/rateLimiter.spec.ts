import { describe, it, expect, vi } from "vitest";
import { createRateLimitedFunction } from "./index.js";

describe("createRateLimitedFunction", () => {
  it("should preserve function signature and return value", () =>
    Promise.resolve().then(async () => {
      const mockFn = vi.fn((a: number, b: string) =>
        Promise.resolve(`${a}-${b}`),
      );
      const rateLimited = createRateLimitedFunction(mockFn, 10);

      const result = await rateLimited(42, "test");

      expect(result).toBe("42-test");
      expect(mockFn).toHaveBeenCalledWith(42, "test");
    }));

  it("should use default RPM of 10", () =>
    Promise.resolve().then(async () => {
      const mockFn = vi.fn(() => Promise.resolve("ok"));
      const rateLimited = createRateLimitedFunction(mockFn);

      await rateLimited();

      expect(mockFn).toHaveBeenCalled();
    }));
});
