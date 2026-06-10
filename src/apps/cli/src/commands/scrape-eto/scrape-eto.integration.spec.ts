import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { dir as tmpDir } from "tmp-promise";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { runScrapeEto } from "./scrape-eto.js";

// Minimal valid ETO record: only these five fields are required by the
// parser's schema; everything else defaults.
const record = (clusterId: number) =>
  JSON.stringify({
    cluster_id: clusterId,
    NP: 10,
    age: 5,
    citation_percentile: 50,
    n_patents_percentile: 50,
  });

// Two valid records, a blank line, a non-JSON line, and a valid-JSON record that
// fails the parser's schema.
const inputJsonl =
  [record(1), "", record(2), "not json", "{}"].join("\n") + "\n";

const outputSchema = z.object({ id: z.number() });

const withFixtures =
  (run: (paths: { input: string; output: string }) => Promise<void>) =>
  async () => {
    const dir = await tmpDir({ unsafeCleanup: true });
    try {
      const input = join(dir.path, "clusters.jsonl");
      const output = join(dir.path, "out.ndjson");
      await writeFile(input, inputJsonl);
      await run({ input, output });
    } finally {
      await dir.cleanup();
    }
  };

describe("scrape-eto", () => {
  it(
    "should stream valid records to NDJSON and skip malformed lines",
    withFixtures(async ({ input, output }) => {
      const result = await runScrapeEto({ input, output });

      // The blank line is skipped silently — only the two genuinely malformed
      // lines count toward `skipped`.
      expect(result).toEqual({ processed: 2, skipped: 2 });

      const lines = (await readFile(output, "utf-8")).trim().split("\n");
      const ids = lines.map((line) => outputSchema.parse(JSON.parse(line)).id);
      expect(ids).toEqual([1, 2]);
    }),
  );
});
