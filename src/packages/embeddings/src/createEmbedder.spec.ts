import { describe, it, expect } from "vitest";
import { createEmbedder } from "./createEmbedder.js";

describe("createEmbedder", () => {
  it("creates dummy embedder with correct dimension", async () => {
    const embedder = createEmbedder(
      { provider: "dummy", dimension: 128 },
      "document",
    );

    const result = await embedder.embed("test text");

    expect(result.embedding).toHaveLength(128);
  });
});
