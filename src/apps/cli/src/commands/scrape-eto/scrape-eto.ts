import { Command } from "commander";
import { createReadStream, createWriteStream } from "node:fs";
import { basename } from "node:path";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";
import { parseCluster } from "@map-of-science/eto-cluster-parser";
import { resolveSourceFiles } from "./source.js";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

async function* readLines(path: string) {
  const lines = createInterface({
    input: createReadStream(path, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  for await (const raw of lines) {
    lineNumber += 1;
    yield { lineNumber, raw };
  }
}

export const runScrapeEto = async ({
  input,
  output,
}: {
  input: string;
  output: string;
}) => {
  const files = await resolveSourceFiles({ input });

  let processed = 0;
  let skipped = 0;

  async function* toNdjson() {
    for (const [index, file] of files.entries()) {
      let fileProcessed = 0;
      let fileSkipped = 0;

      for await (const { lineNumber, raw } of readLines(file)) {
        if (!raw.trim()) {
          continue;
        }

        try {
          const cluster = parseCluster(JSON.parse(raw));
          fileProcessed += 1;
          yield `${JSON.stringify(cluster)}\n`;
        } catch (error) {
          fileSkipped += 1;
          console.error(
            `Skipping malformed line ${lineNumber} in ${basename(file)}: ${errorMessage(error)}`,
          );
        }
      }

      processed += fileProcessed;
      skipped += fileSkipped;
      console.error(
        `[${index + 1}/${files.length}] ${basename(file)}: processed ${fileProcessed}, skipped ${fileSkipped}`,
      );
    }
  }

  await pipeline(toNdjson(), createWriteStream(output));

  console.error(`Done. Processed ${processed}, skipped ${skipped}.`);

  return { processed, skipped };
};

export const createScrapeEtoCommand = () => {
  const command = new Command("scrape-eto");

  command
    .description("Parse the ETO cluster JSONL dataset to NDJSON")
    .requiredOption(
      "-i, --input <path>",
      "ETO cluster_details JSONL file, or a directory of them",
    )
    .requiredOption("-o, --output <path>", "Output NDJSON file path")
    .action(async (options: { input: string; output: string }) => {
      await runScrapeEto(options);
    });

  return command;
};
