import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createDummyGenerator } from "./dummy.js";

describe("createDummyGenerator", () => {
  it("should return configured response validated against schema", async () => {
    const generator = createDummyGenerator({
      response: { label: "test label" },
    });

    const schema = z.object({
      label: z.string(),
    });

    const result = await generator.generate({
      prompt: "ignored",
      schema,
    });

    expect(result.object.label).toBe("test label");
    expect(result.price).toEqual({ raw: 0, formatted: "$0.00" });
  });

  it("should throw if response does not match schema", async () => {
    const generator = createDummyGenerator({
      response: { wrong: "field" },
    });

    const schema = z.object({
      label: z.string(),
    });

    await expect(
      generator.generate({ prompt: "ignored", schema }),
    ).rejects.toThrow();
  });
});
