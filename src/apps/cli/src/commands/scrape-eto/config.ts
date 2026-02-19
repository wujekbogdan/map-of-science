import { z } from "zod";

const cliSchema = z.object({
  input: z.string(),
  output: z.string(),
  start: z.coerce.number().default(0),
  limit: z.coerce.number().default(Infinity),
});

export const createScrapeEtoConfig = (cliArgs: Record<string, unknown>) =>
  cliSchema.parse(cliArgs);
