import { Command } from "commander";
import { createEmbedCommand } from "./commands/embed/index.js";
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

  return program;
};
