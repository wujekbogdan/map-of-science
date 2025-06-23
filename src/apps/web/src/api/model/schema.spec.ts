import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { ZodSchema } from "zod";
import { describe, it, expect } from "@map-of-science/vitest";
import { ConceptSchema, AreaSchema, MakeClustersSchema } from ".";
import { setCollector } from "../../csv/collector.ts";
import { parse as csvParse } from "../../csv/parse.ts";

const parse = async (name: string, schema: ZodSchema) => {
  const filePath = fileURLToPath(
    new URL(`./__test__/${name}`, import.meta.url),
  );
  const file = await readFile(filePath, "utf-8");
  const collector = setCollector();

  await csvParse(
    () => file, // Correctly pass provider function
    (row) => {
      collector.add(schema.parse(row));
    },
  );

  return collector.getResults();
};

describe("schema", () => {
  describe("data.tsv", () => {
    it("should parse data.tsv with labels, including a null label case", async () => {
      const [withLabel, withoutLabel] = await parse(
        "data.tsv",
        MakeClustersSchema(new Map())(z),
      );

      expect([withLabel, withoutLabel]).toEqual([
        {
          clusterId: 84872,
          x: -90.2114,
          y: 71.396,
          numRecentArticles: 228,
          clusterCategory: 5,
          growthRating: 15.43,
          keyConcepts: [198432, 37537, 12177, 43800, 43431],
        },
        {
          clusterId: 72062,
          x: -76.1376,
          y: 37.2588,
          numRecentArticles: 239,
          clusterCategory: 5,
          growthRating: 3.22,
          keyConcepts: [40293, 71377, 120209, 90737, 67314],
        },
      ]);
    });
  });

  describe("keys.tsv", () => {
    it("should parse keys keys.tsv", async () => {
      const [firstItem] = await parse("keys.tsv", ConceptSchema(z));
      expect(firstItem).toEqual({
        index: 0,
        key: "12-20210031",
      });
    });
  });

  describe("area_labels.tsv", () => {
    it("should parse labels area_labels.tsv", async () => {
      const [firstItem] = await parse("area_labels.tsv", AreaSchema(z));
      expect(firstItem).toEqual({
        id: "5ed40bc1-cf8f-5067-87df-2382b03048f4",
        x: -8.441680160507701,
        y: 31.819944878207195,
        level: 1,
        clusterId: null,
      });
    });
  });
});
