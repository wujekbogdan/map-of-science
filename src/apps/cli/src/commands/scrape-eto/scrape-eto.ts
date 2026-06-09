import { Command } from "commander";

// Inert until reworked to read the ETO JSONL dataset.
export const createScrapeEtoCommand = () =>
  new Command("scrape-eto").description(
    "Disabled pending rework for the ETO JSONL dataset",
  );
