import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { file } from "tmp-promise";
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { scrapeEto } from "./scrape-eto.js";

const fixturesDir = join(import.meta.dirname, "__fixtures__");

const clusterResultSchema = z.object({
  id: z.number(),
  totalArticles: z.number(),
  articles: z.object({
    core: z.array(z.string()),
    review: z.array(z.string()),
    highlyCited: z.array(z.string()),
  }),
});

describe("scrape-eto e2e", () => {
  it("scrapes clusters 0, 1, 2 and reports cluster 3 as missing", async () => {
    const { path: outputPath, cleanup } = await file({ postfix: ".ndjson" });

    try {
      const { processed, missing } = await scrapeEto({
        input: fixturesDir,
        output: outputPath,
        start: "0",
        limit: "4",
      });

      expect(processed).toBe(3);
      expect(missing).toEqual([3]);

      const content = await readFile(outputPath, "utf-8");
      const lines = content.trim().split("\n");
      const results = lines.map((line) =>
        clusterResultSchema.parse(JSON.parse(line)),
      );

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe(0);
      expect(results[1].id).toBe(1);
      expect(results[2].id).toBe(2);
      expect(results.every((r) => r.totalArticles > 0)).toBe(true);
      expect(results.every((r) => r.articles.core.length > 0)).toBe(true);
    } finally {
      await cleanup();
    }
  });
});
