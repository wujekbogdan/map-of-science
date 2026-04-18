import { describe, it, expect } from "vitest";
import { z } from "zod";
import { arrayCollector } from "./collector.js";
import { createProcessor } from "./utils.js";

describe("utils", () => {
  describe("createProcessor", () => {
    it("should validate and collect items", () => {
      const schema = z.object({ name: z.string() });
      const collector = arrayCollector<z.infer<typeof schema>>();
      const processor = createProcessor(schema, collector);

      processor.process({ name: "Alice" });
      processor.process({ name: "Bob" });

      expect(processor.getResults()).toEqual([
        { name: "Alice" },
        { name: "Bob" },
      ]);
    });

    it("should throw on invalid data", () => {
      const schema = z.object({ name: z.string() });
      const processor = createProcessor(schema, arrayCollector());

      expect(() => processor.process({ name: 123 })).toThrow();
    });
  });
});
