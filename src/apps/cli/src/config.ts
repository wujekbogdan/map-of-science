import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  gemini: z.object({
    apiKey: z.string(),
  }),
  qdrant: z.object({
    url: z.string(),
    apiKey: z.string().optional(),
    collectionName: z.string().default("clusters"),
  }),
  rateLimits: z.object({
    gemini: z.coerce.number().default(10),
  }),
});

const cliSchema = z.object({
  input: z.string(),
  start: z.coerce.number().default(0),
  limit: z.coerce.number().default(Infinity),
  maxTitles: z.coerce.number().optional(),
});

const parseEnv = () =>
  envSchema.parse({
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
    },
    qdrant: {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: process.env.QDRANT_COLLECTION,
    },
    rateLimits: {
      gemini: process.env.GEMINI_RPM,
    },
  });

export const createConfig = (cliArgs: Record<string, unknown>) => ({
  ...parseEnv(),
  ...cliSchema.parse(cliArgs),
  embeddingDimension: 768 as const,
});

export type Config = ReturnType<typeof createConfig>;
