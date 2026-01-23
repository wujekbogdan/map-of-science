import { describe, it, expect, beforeAll } from "vitest";
import { z } from "zod";
import { createGeminiGenerator } from "./gemini.js";

describe("createGeminiGenerator", () => {
  const apiKey = process.env.GOOGLE_API_KEY;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY required");
    }
  });

  it("should generate structured output matching schema", async () => {
    const generator = createGeminiGenerator({
      apiKey: apiKey!,
      model: "gemini-2.0-flash-lite",
    });

    const schema = z.object({
      label: z.string(),
    });

    const result = await generator.generate({
      prompt: "Return a single word label for the topic: machine learning",
      schema,
    });

    expect(result.object.label).toBeDefined();
    expect(typeof result.object.label).toBe("string");
    expect(result.price).toMatchInlineSnapshot(`"$0.000006"`);
  }, 30_000);
});
