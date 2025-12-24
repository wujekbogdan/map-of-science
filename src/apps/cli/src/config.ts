import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  openAlex: z.object({
    apiKey: z.string(),
    email: z.string(),
  }),
  gemini: z.object({
    apiKey: z.string(),
  }),
  qdrant: z.object({
    url: z.string(),
    apiKey: z.string().optional(),
    collectionName: z.string().default("clusters"),
  }),
  rateLimits: z.object({
    openAlex: z.coerce.number().default(10),
    gemini: z.coerce.number().default(10),
  }),
});

const cliSchema = z.object({
  input: z.string(),
  start: z.coerce.number().default(0),
  limit: z.coerce.number().default(Infinity),
  maxArticles: z.coerce.number().default(10),
});

const parseEnv = () =>
  envSchema.parse({
    openAlex: {
      apiKey: process.env.OPENALEX_API_KEY,
      email: process.env.OPENALEX_EMAIL,
    },
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
    },
    qdrant: {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: process.env.QDRANT_COLLECTION,
    },
    rateLimits: {
      openAlex: process.env.OPENALEX_RPM,
      gemini: process.env.GEMINI_RPM,
    },
  });

export const createConfig = (cliArgs: Record<string, unknown>) => ({
  ...parseEnv(),
  ...cliSchema.parse(cliArgs),
  embeddingDimension: 768 as const,
});

export type Config = ReturnType<typeof createConfig>;
