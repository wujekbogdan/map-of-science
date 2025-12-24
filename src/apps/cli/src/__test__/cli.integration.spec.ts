import path from "node:path";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { createQdrantStore } from "@map-of-science/vector-store";
import {
  withQdrantContainer,
  type Qdrant,
} from "@map-of-science/vector-store/test";
import { embed } from "../commands/embed/embed.js";
import { search } from "../commands/search/search.js";

const FIXTURE_PATH = path.join(import.meta.dirname, "clusters.json");
const EMBEDDING_DIM = 768;

describe("CLI E2E", () => {
  const required = [
    "OPENALEX_API_KEY",
    "OPENALEX_EMAIL",
    "GOOGLE_API_KEY",
  ] as const;

  beforeAll(() => {
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Required env vars: ${missing.join(", ")}`);
    }
  });

  it(
    "should embed clusters and search them",
    withQdrantContainer(async (qdrant: Qdrant) => {
      for (const key of required) {
        vi.stubEnv(key, process.env[key]);
      }
      vi.stubEnv("QDRANT_URL", qdrant.url);
      vi.stubEnv("QDRANT_COLLECTION", "test-embed-e2e");

      const result = await embed({
        input: FIXTURE_PATH,
        limit: "5",
        maxArticles: "3",
      });

      expect(result.processed).toBe(5);

      const store = createQdrantStore({
        url: qdrant.url,
        collectionName: "test-embed-e2e",
        vectors: {
          concepts: { size: EMBEDDING_DIM },
          articles: { size: EMBEDDING_DIM },
        },
      });

      const point0 = await store.get("0");
      expect(point0).not.toBeNull();
      expect(point0?.vectors.concepts).toHaveLength(EMBEDDING_DIM);
      expect(point0?.vectors.articles).toHaveLength(EMBEDDING_DIM);

      const point4 = await store.get("4");
      expect(point4).not.toBeNull();

      const point5 = await store.get("5");
      expect(point5).toBeNull();

      // Search embedded clusters
      const searchResult = await search("perovskite solar cells", {
        vector: "articles",
        limit: "5",
      });

      expect(searchResult.results.length).toBeGreaterThan(0);
      expect(searchResult.results[0].score).toBeGreaterThan(0);
    }),
    180_000,
  );
});
