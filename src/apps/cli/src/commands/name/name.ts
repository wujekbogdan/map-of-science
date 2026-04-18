import { Command } from "commander";
import { createClusterNamer } from "@map-of-science/cluster-namer";
import { streamNdjsonFile } from "@map-of-science/parsers/node";
import { createGenerator } from "@map-of-science/text-generator";
import { forEachEntry } from "../../utils/stream.js";
import { createNameConfig } from "./config.js";
import { formatTsvHeader, formatTsvRow } from "./output.js";
import { clusterSchema } from "./schema.js";

const compose = (config: ReturnType<typeof createNameConfig>) => {
  const generator = createGenerator({
    provider: "gemini",
    apiKey: config.gemini.apiKey,
    model: config.gemini.model,
  });

  // TODO: Add rate limiting - createRateLimitedFunction loses generic types
  const nameCluster = createClusterNamer({
    generate: generator.generate,
  });

  return { nameCluster };
};

type NameOptions = {
  input: string;
  output?: string;
  start?: string;
  limit?: string;
  maxTitles?: string;
};

export const name = async (options: NameOptions) => {
  const config = createNameConfig(options);
  const { nameCluster } = compose(config);

  const generator = streamNdjsonFile(config.input);

  console.log(formatTsvHeader());

  const prices: number[] = [];

  await forEachEntry(
    generator,
    { start: config.start, limit: config.limit },
    async (entry, position) => {
      const result = clusterSchema.safeParse(entry);

      if (!result.success) {
        console.error(`Skipping invalid cluster`);
        return;
      }

      const { data, price } = await nameCluster(
        { id: String(result.data.id), titles: result.data.titles },
        { maxTitles: config.maxTitles },
      );

      prices.push(price.raw);

      console.log(formatTsvRow(data.id, data.label));
      console.error(
        `[${position}/${config.limit}] ${result.data.id}: ${data.label} (${price.formatted})`,
      );
    },
  );

  const totalPrice = prices.reduce((sum, price) => sum + price, 0);
  console.error(`Total cost: $${totalPrice.toFixed(6)}`);
};

export const createNameCommand = () => {
  const command = new Command("name");

  command
    .description("Generate names for clusters using LLM")
    .requiredOption("-i, --input <path>", "Path to clusters NDJSON file")
    .option("-s, --start <number>", "Start index (0-based)")
    .option("-l, --limit <number>", "Number of clusters to process")
    .option("-m, --max-titles <number>", "Max titles per cluster")
    .action(async (options: NameOptions) => {
      await name(options);
    });

  return command;
};
