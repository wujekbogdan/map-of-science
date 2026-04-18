import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  gemini: z.object({
    apiKey: z.string(),
    model: z.string().default("gemini-2.0-flash-lite"),
  }),
  rateLimits: z.object({
    gemini: z.coerce.number().default(15),
  }),
});

const cliSchema = z.object({
  input: z.string(),
  output: z.string().optional(),
  start: z.coerce.number().default(0),
  limit: z.coerce.number().default(Infinity),
  maxTitles: z.coerce.number().default(10),
});

const parseEnv = () =>
  envSchema.parse({
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GEMINI_MODEL,
    },
    rateLimits: {
      gemini: process.env.GEMINI_RPM,
    },
  });

export const createNameConfig = (cliArgs: Record<string, unknown>) => ({
  ...parseEnv(),
  ...cliSchema.parse(cliArgs),
});
