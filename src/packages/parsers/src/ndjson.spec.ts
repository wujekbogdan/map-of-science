import { Readable } from "node:stream";
import { describe, it, expect } from "vitest";
import { streamNdjson } from "./ndjson.js";

const createStreamFromString = (content: string) =>
  Readable.from([content]) as NodeJS.ReadableStream;

const collectAll = async (ndjson: string) => {
  const items: unknown[] = [];
  for await (const item of streamNdjson(createStreamFromString(ndjson))) {
    items.push(item);
  }
  return items;
};

describe("ndjson", () => {
  describe("streamNdjson", () => {
    it("should yield parsed objects from each line", async () => {
      const items = await collectAll(
        '{"id":1,"name":"alice"}\n{"id":2,"name":"bob"}',
      );

      expect(items).toEqual([
        { id: 1, name: "alice" },
        { id: 2, name: "bob" },
      ]);
    });

    it("should handle empty lines", async () => {
      const items = await collectAll('{"id":1}\n\n{"id":2}\n');

      expect(items).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should handle whitespace-only lines", async () => {
      const items = await collectAll('{"id":1}\n   \n{"id":2}');

      expect(items).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should handle empty input", async () => {
      const items = await collectAll("");

      expect(items).toEqual([]);
    });

    it("should allow breaking early", async () => {
      const ndjson = '{"id":1}\n{"id":2}\n{"id":3}';
      const items = [];

      for await (const item of streamNdjson(createStreamFromString(ndjson))) {
        items.push(item);
        if (items.length >= 2) break;
      }

      expect(items).toHaveLength(2);
    });

    it("should propagate errors from invalid JSON", async () => {
      await expect(
        collectAll('{"valid":1}\n{invalid}\n{"valid":2}'),
      ).rejects.toThrow();
    });
  });
});
