import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { createGeminiGenerator } from "./gemini.js";

vi.mock("ai", () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: { label: "mocked" },
    usage: { inputTokens: 10, outputTokens: 5 },
  }),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn(() => "mock-model")),
}));

describe("createGeminiGenerator", () => {
  it("should call generateObject with correct params", async () => {
    const { generateObject } = await import("ai");

    const generator = createGeminiGenerator({
      apiKey: "test-key",
      model: "gemini-2.0-flash-lite",
    });

    const schema = z.object({ label: z.string() });

    await generator.generate({
      prompt: "test prompt",
      schema,
      temperature: 0.5,
    });

    expect(generateObject).toHaveBeenCalledWith({
      model: "mock-model",
      schema,
      prompt: "test prompt",
      temperature: 0.5,
    });
  });
});
