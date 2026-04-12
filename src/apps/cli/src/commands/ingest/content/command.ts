import { QdrantClient } from "@qdrant/js-client-rest";
import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { createAtlasStore } from "@map-of-science/atlas-store";
import { parseCsv } from "@map-of-science/parsers/node";
import { ingestContent } from "./ingestContent.js";

const envSchema = z.object({
  url: z.string(),
  apiKey: z.string().optional(),
});

const cliSchema = z.object({
  input: z.string(),
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

export const runIngestContent = async (options: Options) => {
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

  const result = await ingestContent({
    qdrant,
    contentRepo: atlasStore.content,
    readContent: () => readTsv(args.input),
  });

  console.log(`Ingested ${result.count} content items.`);
};

export const createIngestContentCommand = () => {
  const command = new Command("ingest:content");

  command
    .description("Ingest YouTube segments as ContentItems into Qdrant")
    .requiredOption("--input <path>", "Path to youtube.tsv")
    .action(runIngestContent);

  return command;
};
