import path from "node:path";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { createQdrantStore } from "@map-of-science/vector-store";
import {
  withQdrantContainer,
  type Qdrant,
} from "@map-of-science/vector-store/test";
import { embed } from "../commands/embed/embed.js";

const CLUSTERS_FIXTURE_PATH = path.join(import.meta.dirname, "clusters.ndjson");
const CLUSTERS_WITH_INVALID_FIXTURE_PATH = path.join(
  import.meta.dirname,
  "clusters-with-invalid.ndjson",
);
const EMBEDDING_DIM = 768;

// TODO: the embed command still writes the old payload shape via vector-store.
// Once the ingest pipeline writes full ClusterInput via atlas-store, re-enable
// the search portion of this test and drop the vector-store verification.
describe("CLI E2E", () => {
  const required = ["GOOGLE_API_KEY"] as const;

  beforeAll(() => {
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Required env vars: ${missing.join(", ")}`);
    }
  });

  it(
    "should embed clusters and verify they exist in qdrant",
    withQdrantContainer(async (qdrant: Qdrant) => {
      for (const key of required) {
        vi.stubEnv(key, process.env[key]);
      }
      vi.stubEnv("QDRANT_URL", qdrant.url);
      vi.stubEnv("QDRANT_COLLECTION", "test-embed-e2e");

      const result = await embed({
        input: CLUSTERS_FIXTURE_PATH,
        limit: "5",
      });

      expect(result.processed).toBe(3);

      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-embed-e2e",
        vectors: {
          titles: { size: EMBEDDING_DIM },
        },
      });

      const point0 = await store.get("0");
      expect(point0).not.toBeNull();
      expect(point0?.vectors.titles).toHaveLength(EMBEDDING_DIM);

      const point2 = await store.get("2");
      expect(point2).not.toBeNull();

      const point3 = await store.get("3");
      expect(point3).toBeNull();
    }),
    180_000,
  );

  it(
    "should skip invalid clusters",
    withQdrantContainer(async (qdrant: Qdrant) => {
      for (const key of required) {
        vi.stubEnv(key, process.env[key]);
      }
      vi.stubEnv("QDRANT_URL", qdrant.url);
      vi.stubEnv("QDRANT_COLLECTION", "test-skip-invalid");

      const result = await embed({
        input: CLUSTERS_WITH_INVALID_FIXTURE_PATH,
      });

      expect(result.processed).toBe(4);

      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-skip-invalid",
        vectors: {
          titles: { size: EMBEDDING_DIM },
        },
      });

      const point0 = await store.get("0");
      expect(point0).not.toBeNull();

      const point1 = await store.get("1");
      expect(point1).not.toBeNull();

      const point2 = await store.get("2");
      expect(point2).not.toBeNull();
    }),
    180_000,
  );
});
