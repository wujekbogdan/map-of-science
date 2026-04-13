import { describe, it, expect } from "vitest";
import {
  useQdrantContainer,
  withQdrantContainer,
} from "./useQdrantContainer.js";

describe("useQdrantContainer", () => {
  it("should start and stop container", async () => {
    const qdrant = await useQdrantContainer();

    expect(qdrant.url).toMatch(/^http:\/\/.+:\d+$/);
    expect(qdrant.container).toBeTruthy();
    expect(typeof qdrant.stop).toBe("function");

    await qdrant.stop();
  }, 60_000);

  it(
    "should work with withQdrantContainer wrapper",
    withQdrantContainer((qdrant) => {
      expect(qdrant.url).toMatch(/^http:\/\/.+:\d+$/);
      expect(qdrant.container).toBeTruthy();
      expect(typeof qdrant.stop).toBe("function");
      return Promise.resolve();
    }),
    60_000,
  );
});
