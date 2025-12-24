import { describe, it, expect, vi } from "vitest";
import { forEachEntry } from "./stream.js";

async function* createGenerator<T>(
  items: { key: string; value: T }[],
): AsyncGenerator<{ key: string; value: T }> {
  for (const item of items) {
    await Promise.resolve();
    yield item;
  }
}

describe("forEachEntry", () => {
  it("should process all entries when limit is greater than count", async () => {
    const onEntry = vi.fn().mockResolvedValue(undefined);

    const generator = createGenerator([
      { key: "1", value: "a" },
      { key: "2", value: "b" },
    ]);

    const processed = await forEachEntry(
      generator,
      { start: 0, limit: 10 },
      onEntry,
    );

    expect(processed).toBe(2);
    expect(onEntry).toHaveBeenCalledTimes(2);
    expect(onEntry).toHaveBeenNthCalledWith(1, "1", "a");
    expect(onEntry).toHaveBeenNthCalledWith(2, "2", "b");
  });

  it("should respect limit option", async () => {
    const onEntry = vi.fn().mockResolvedValue(undefined);

    const generator = createGenerator([
      { key: "1", value: "a" },
      { key: "2", value: "b" },
      { key: "3", value: "c" },
    ]);

    const processed = await forEachEntry(
      generator,
      { start: 0, limit: 2 },
      onEntry,
    );

    expect(processed).toBe(2);
    expect(onEntry).toHaveBeenCalledTimes(2);
  });

  it("should skip entries before start index", async () => {
    const onEntry = vi.fn().mockResolvedValue(undefined);

    const generator = createGenerator([
      { key: "1", value: "a" },
      { key: "2", value: "b" },
      { key: "3", value: "c" },
    ]);

    const processed = await forEachEntry(
      generator,
      { start: 1, limit: 10 },
      onEntry,
    );

    expect(processed).toBe(2);
    expect(onEntry).toHaveBeenCalledTimes(2);
    expect(onEntry).toHaveBeenNthCalledWith(1, "2", "b");
    expect(onEntry).toHaveBeenNthCalledWith(2, "3", "c");
  });

  it("should handle empty generator", async () => {
    const onEntry = vi.fn().mockResolvedValue(undefined);

    const generator = createGenerator([]);

    const processed = await forEachEntry(
      generator,
      { start: 0, limit: 10 },
      onEntry,
    );

    expect(processed).toBe(0);
    expect(onEntry).not.toHaveBeenCalled();
  });

  it("should combine start and limit correctly", async () => {
    const onEntry = vi.fn().mockResolvedValue(undefined);

    const generator = createGenerator([
      { key: "1", value: "a" },
      { key: "2", value: "b" },
      { key: "3", value: "c" },
      { key: "4", value: "d" },
      { key: "5", value: "e" },
    ]);

    const processed = await forEachEntry(
      generator,
      { start: 2, limit: 2 },
      onEntry,
    );

    expect(processed).toBe(2);
    expect(onEntry).toHaveBeenCalledTimes(2);
    expect(onEntry).toHaveBeenNthCalledWith(1, "3", "c");
    expect(onEntry).toHaveBeenNthCalledWith(2, "4", "d");
  });
});
