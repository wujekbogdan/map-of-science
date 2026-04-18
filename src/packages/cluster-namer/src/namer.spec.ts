import { describe, it, expect, vi } from "vitest";
import { createClusterNamer } from "./namer.js";

describe("createClusterNamer", () => {
  const mockGenerate = () =>
    vi.fn().mockResolvedValueOnce({
      object: { english: "lowercase label" },
      price: { raw: 0.01, formatted: "$0.01" },
    });

  it("should not call generate when titles empty", async () => {
    const generate = mockGenerate();
    const namer = createClusterNamer({ generate });

    await namer({ id: "1", titles: [] });

    expect(generate).not.toHaveBeenCalled();
  });

  it("should call generate with deduplicated titles in prompt", async () => {
    const generate = mockGenerate();
    const namer = createClusterNamer({ generate });

    await namer({ id: "1", titles: ["A", "A", "B", "B", "C"] });

    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("1. A\n2. B\n3. C") as string,
      }),
    );
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.not.stringContaining("4.") as string,
      }),
    );
  });

  it("should call generate with titles limited to maxTitles", async () => {
    const generate = mockGenerate();
    const namer = createClusterNamer({ generate });

    await namer(
      { id: "1", titles: ["A", "B", "C", "D", "E"] },
      { maxTitles: 2 },
    );

    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("1. A\n2. B") as string,
      }),
    );
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.not.stringContaining("3.") as string,
      }),
    );
  });

  it("should capitalize first letter of returned label", async () => {
    const generate = mockGenerate();
    const namer = createClusterNamer({ generate });

    const result = await namer({ id: "1", titles: ["X"] });

    expect(result.data.label).toBe("Lowercase label");
  });

  it("should use custom buildPrompt when provided", async () => {
    const generate = mockGenerate();
    const customPrompt = (titles: string[]) => `Custom: ${titles.join(",")}`;
    const namer = createClusterNamer({ generate });

    await namer({ id: "1", titles: ["X", "Y"] }, { buildPrompt: customPrompt });

    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Custom: X,Y",
      }),
    );
  });
});
