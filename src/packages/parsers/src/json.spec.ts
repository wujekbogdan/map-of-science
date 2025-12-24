import { Readable } from "node:stream";
import { describe, it, expect } from "vitest";
import { streamJson } from "./json.js";

const createStreamFromString = (content: string) =>
  Readable.from([content]) as NodeJS.ReadableStream;

describe("json", () => {
  describe("streamJson", () => {
    it("should yield items from JSON object", async () => {
      const json = JSON.stringify({ alice: { age: 30 }, bob: { age: 40 } });
      const items = [];

      for await (const item of streamJson(createStreamFromString(json))) {
        items.push(item);
      }

      expect(items).toEqual([
        { key: "alice", value: { age: 30 } },
        { key: "bob", value: { age: 40 } },
      ]);
    });

    it("should handle empty object", async () => {
      const items = [];

      for await (const item of streamJson(createStreamFromString("{}"))) {
        items.push(item);
      }

      expect(items).toEqual([]);
    });

    it("should allow breaking early", async () => {
      const json = JSON.stringify({ a: 1, b: 2, c: 3 });
      const items = [];

      for await (const item of streamJson(createStreamFromString(json))) {
        items.push(item);
        if (items.length >= 2) break;
      }

      expect(items).toHaveLength(2);
    });

    it("should propagate errors from invalid JSON", async () => {
      const generator = streamJson(createStreamFromString("{ invalid }"));

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _item of generator) {
          // consume
        }
      }).rejects.toThrow();
    });
  });
});
