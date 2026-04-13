import { QdrantClient } from "@qdrant/js-client-rest";
import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { createAtlasStore } from "@map-of-science/atlas-store";
import { parseCsv } from "@map-of-science/parsers/node";
import { ingestAreas } from "./ingestAreas.js";

const envSchema = z.object({
  url: z.string(),
  apiKey: z.string().optional(),
});

const cliSchema = z.object({
  areas: z.string(),
  i18n: z.string(),
});

type Options = z.infer<typeof cliSchema>;

const readTsv = async <Row extends Record<string, string>>(path: string) => {
  const rows: Row[] = [];
  await parseCsv<Row, void>(
    () => readFile(path, "utf-8"),
    (row: Row) => {
      rows.push(row);
    },
  );
  return rows;
};

export const runIngestAreas = async (options: Options) => {
  const env = envSchema.parse({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });
  const args = cliSchema.parse(options);

  const qdrant = new QdrantClient({
    url: env.url,
    ...(env.apiKey && { apiKey: env.apiKey }),
  });
  const atlasStore = createAtlasStore({ qdrant });

  const result = await ingestAreas({
    areasRepo: atlasStore.areas,
    readAreas: () => readTsv(args.areas),
    readI18n: () => readTsv(args.i18n),
  });

  console.log(`Ingested ${result.count} areas.`);
};

export const createIngestAreasCommand = () => {
  const command = new Command("ingest:areas");

  command
    .description("Ingest areas (tiers 1-3) from TSV files into Qdrant")
    .requiredOption("--areas <path>", "Path to areas.tsv")
    .requiredOption("--i18n <path>", "Path to map_entities_i18n.tsv")
    .action(runIngestAreas);

  return command;
};
