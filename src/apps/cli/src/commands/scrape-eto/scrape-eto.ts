import { Command } from "commander";
import { readFile, appendFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseClusterPdf } from "@map-of-science/eto-pdf-parser";
import { createScrapeEtoConfig } from "./config.js";

type ProcessParams = {
  inputDir: string;
  outputPath: string;
  currentId: number;
  remaining: number;
  processed: number;
  missing: number[];
  failed: { id: number; error: string }[];
  total: number;
};

type ProcessResult = {
  processed: number;
  missing: number[];
  failed: { id: number; error: string }[];
};

const readPdf = async (path: string) => {
  try {
    return await readFile(path);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const processCluster = async (
  params: ProcessParams,
): Promise<ProcessResult> => {
  if (params.remaining === 0) {
    return {
      processed: params.processed,
      missing: params.missing,
      failed: params.failed,
    };
  }

  const pdfPath = join(params.inputDir, `cluster_${params.currentId}.pdf`);
  const buffer = await readPdf(pdfPath);

  if (!buffer) {
    return processCluster({
      ...params,
      currentId: params.currentId + 1,
      remaining: params.remaining - 1,
      missing: [...params.missing, params.currentId],
    });
  }

  try {
    const result = await parseClusterPdf(buffer);
    await appendFile(params.outputPath, JSON.stringify(result) + "\n");

    const done = params.processed + 1;
    const { core, review, highlyCited } = result.articles;
    console.log(
      `[${done}/${params.total}] Cluster ${params.currentId}: core=${core.length} review=${review.length} cited=${highlyCited.length}`,
    );

    return processCluster({
      ...params,
      currentId: params.currentId + 1,
      remaining: params.remaining - 1,
      processed: done,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[FAILED] Cluster ${params.currentId}: ${errorMessage}`);

    return processCluster({
      ...params,
      currentId: params.currentId + 1,
      remaining: params.remaining - 1,
      failed: [...params.failed, { id: params.currentId, error: errorMessage }],
    });
  }
};

export const scrapeEto = async (options: Record<string, unknown>) => {
  const config = createScrapeEtoConfig(options);

  console.log(
    `Processing clusters ${config.start} to ${config.start + config.limit - 1}`,
  );
  await writeFile(config.output, "");

  const { processed, missing, failed } = await processCluster({
    inputDir: config.input,
    outputPath: config.output,
    currentId: config.start,
    remaining: config.limit,
    processed: 0,
    missing: [],
    failed: [],
    total: config.limit,
  });

  console.log(`Done. Processed ${processed} clusters.`);
  if (missing.length > 0) {
    console.log(`Missing ${missing.length} IDs: ${missing.join(", ")}`);
  }
  if (failed.length > 0) {
    console.log(`Failed ${failed.length} IDs:`);
    for (const { id, error } of failed) {
      console.log(`  - ${id}: ${error}`);
    }
  }

  return { processed, missing, failed };
};

export const createScrapeEtoCommand = () => {
  const command = new Command("scrape-eto");

  command
    .description("Scrape article titles from ETO cluster PDFs to NDJSON")
    .requiredOption(
      "-i, --input <path>",
      "Directory containing cluster_*.pdf files",
    )
    .requiredOption("-o, --output <path>", "Output NDJSON file path")
    .requiredOption("-s, --start <number>", "Starting cluster ID")
    .requiredOption("-l, --limit <number>", "Number of clusters to process")
    .action(async (options: Record<string, unknown>) => {
      await scrapeEto(options);
    });

  return command;
};
