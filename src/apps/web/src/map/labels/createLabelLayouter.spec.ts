import { describe, expect, it, vi } from "vitest";
import { createLabelLayouter } from "./createLabelLayouter.ts";

describe("createLabelLayouter", () => {
  it("should return the same layout instance for a repeated call", () => {
    const layouter = createLabelLayouter({
      measureText: (text) => text.length * 6,
    });

    const first = layouter("Paris", 140);
    const second = layouter("Paris", 140);

    expect(second).toBe(first);
  });

  it("should call the measurer only once per unique text and budget", () => {
    const measureText = vi.fn((text: string) => text.length * 6);
    const layouter = createLabelLayouter({ measureText });

    layouter("Paris", 140);
    layouter("Paris", 140);
    layouter("Paris", 140);

    expect(measureText).toHaveBeenCalledTimes(1);
  });
});
