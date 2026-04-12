import type { QdrantClient } from "@qdrant/js-client-rest";
import { describe, expect, it, vi } from "vitest";
import { assertCollectionMissing } from "./assertCollectionMissing.js";

const buildQdrant = (exists: boolean) =>
  ({
    collectionExists: vi.fn().mockResolvedValueOnce({ exists }),
  }) as unknown as QdrantClient;

describe("assertCollectionMissing", () => {
  it("resolves when the collection does not exist", async () => {
    await expect(
      assertCollectionMissing(buildQdrant(false), "areas"),
    ).resolves.toBeUndefined();
  });

  it("throws with a drop hint when the collection already exists", async () => {
    await expect(
      assertCollectionMissing(buildQdrant(true), "areas"),
    ).rejects.toThrow(/Collection 'areas' already exists\. Drop it manually/);
  });
});
