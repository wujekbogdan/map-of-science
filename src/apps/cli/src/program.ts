import { Command } from "commander";
import { createEmbedCommand } from "./commands/embed/index.js";
import { createIngestAreasCommand } from "./commands/ingest/areas/index.js";
import { createIngestClustersCommand } from "./commands/ingest/clusters/index.js";
import { createIngestContentCommand } from "./commands/ingest/content/index.js";
import { createNameCommand } from "./commands/name/index.js";
import { createScrapeEtoCommand } from "./commands/scrape-eto/index.js";
import { createSearchCommand } from "./commands/search/index.js";

export const createCli = () => {
  const program = new Command();

  program.name("cli").description("CLI for map-of-science operations");

  program.addCommand(createEmbedCommand());
  program.addCommand(createNameCommand());
  program.addCommand(createScrapeEtoCommand());
  program.addCommand(createSearchCommand());
  program.addCommand(createIngestAreasCommand());
  program.addCommand(createIngestContentCommand());
  program.addCommand(createIngestClustersCommand());

  return program;
};
