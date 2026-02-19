import { describe, it, expect, vi } from "vitest";
import { forEachEntry } from "./stream.js";

async function* createGenerator<T>(items: T[]) {
  for (const item of items) {
    yield await Promise.resolve(item);
  }
}

describe("forEachEntry", () => {
  it("should process all entries when no limits", async () => {
    const entries: number[] = [];
    const onEntry = vi.fn((entry: number) => {
      entries.push(entry);
    });

    const processed = await forEachEntry(
      createGenerator([1, 2, 3]),
      { start: 0, limit: Infinity },
      onEntry,
    );

    expect(processed).toBe(3);
    expect(entries).toEqual([1, 2, 3]);
  });

  it("should skip entries before start", async () => {
    const entries: number[] = [];

    await forEachEntry(
      createGenerator([1, 2, 3, 4, 5]),
      { start: 2, limit: Infinity },
      (entry) => {
        entries.push(entry);
      },
    );

    expect(entries).toEqual([3, 4, 5]);
  });

  it("should stop after limit entries", async () => {
    const entries: number[] = [];

    const processed = await forEachEntry(
      createGenerator([1, 2, 3, 4, 5]),
      { start: 0, limit: 3 },
      (entry) => {
        entries.push(entry);
      },
    );

    expect(processed).toBe(3);
    expect(entries).toEqual([1, 2, 3]);
  });

  it("should combine start and limit", async () => {
    const entries: number[] = [];

    await forEachEntry(
      createGenerator([1, 2, 3, 4, 5]),
      { start: 1, limit: 2 },
      (entry) => {
        entries.push(entry);
      },
    );

    expect(entries).toEqual([2, 3]);
  });

  it("should pass position starting from 1", async () => {
    const positions: number[] = [];

    await forEachEntry(
      createGenerator(["a", "b", "c"]),
      { start: 0, limit: Infinity },
      (_, position) => {
        positions.push(position);
      },
    );

    expect(positions).toEqual([1, 2, 3]);
  });

  it("should return 0 for empty generator", async () => {
    const processed = await forEachEntry(
      createGenerator([]),
      { start: 0, limit: Infinity },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );

    expect(processed).toBe(0);
  });

  it("should work with object entries", async () => {
    const entries: { key: string; value: number }[] = [];

    await forEachEntry(
      createGenerator([
        { key: "a", value: 1 },
        { key: "b", value: 2 },
      ]),
      { start: 0, limit: Infinity },
      (entry) => {
        entries.push(entry);
      },
    );

    expect(entries).toEqual([
      { key: "a", value: 1 },
      { key: "b", value: 2 },
    ]);
  });
});
