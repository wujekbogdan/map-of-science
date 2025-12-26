import { describe, it, expect, beforeAll } from "vitest";
import { createGeminiEmbedder } from "./gemini.js";

describe("createGeminiEmbedder", () => {
  const apiKey = process.env.GOOGLE_API_KEY;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY required");
    }
  });

  it("should call real Gemini API and return embedding", async () => {
    const embedder = createGeminiEmbedder(
      { apiKey: apiKey!, dimension: 768 },
      "document",
    );
    const text = "Lorem ipsum dolor";
    const result = await embedder.embed(text);

    expect(result.embedding).toBeDefined();
    expect(Array.isArray(result.embedding)).toBe(true);
    expect(result.embedding.length).toBe(768);
    expect(result.embedding[0]).toBeTypeOf("number");
  }, 30_000);
});
