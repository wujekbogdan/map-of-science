import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createDummyGenerator } from "./dummy.js";

describe("createDummyGenerator", () => {
  it("should return configured response validated against schema", () => {
    const generator = createDummyGenerator({
      response: { label: "test label" },
    });

    const schema = z.object({
      label: z.string(),
    });

    const result = generator.generate({
      prompt: "ignored",
      schema,
    });

    expect(result.object.label).toBe("test label");
    expect(result.price).toBe("$0.00");
  });

  it("should throw if response does not match schema", () => {
    const generator = createDummyGenerator({
      response: { wrong: "field" },
    });

    const schema = z.object({
      label: z.string(),
    });

    expect(() => generator.generate({ prompt: "ignored", schema })).toThrow();
  });
});
