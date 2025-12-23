import { Readable } from "node:stream";
import { describe, it, expect, vi } from "vitest";
import { parseJson } from "./json.js";

const createStreamFromString = (content: string) => {
  const readable = new Readable({
    read() {
      this.push(content);
      this.push(null);
    },
  });
  return readable as ReturnType<typeof import("node:fs").createReadStream>;
};

describe("json", () => {
  describe("parseJson", () => {
    it("should parse JSON object and call onItem for each key-value pair", async () => {
      const json = JSON.stringify({ alice: { age: 30 }, bob: { age: 40 } });
      const provider = vi.fn(() => createStreamFromString(json));
      const onItem = vi.fn();

      await parseJson(provider, onItem);

      expect(onItem).toHaveBeenCalledTimes(2);
      expect(onItem).toHaveBeenNthCalledWith(1, "alice", { age: 30 });
      expect(onItem).toHaveBeenNthCalledWith(2, "bob", { age: 40 });
    });

    it("should handle empty object", async () => {
      const provider = vi.fn(() => createStreamFromString("{}"));
      const onItem = vi.fn();

      await parseJson(provider, onItem);

      expect(onItem).not.toHaveBeenCalled();
    });

    it("should reject on invalid JSON", async () => {
      const provider = vi.fn(() => createStreamFromString("{ invalid }"));
      const onItem = vi.fn();

      await expect(parseJson(provider, onItem)).rejects.toThrow();
    });

    it("should propagate errors from onItem", async () => {
      const json = JSON.stringify({ key: "value" });
      const provider = vi.fn(() => createStreamFromString(json));
      const onItem = vi.fn(() => {
        throw new Error("onItem failed");
      });

      await expect(parseJson(provider, onItem)).rejects.toThrow(
        "onItem failed",
      );
    });
  });
});
