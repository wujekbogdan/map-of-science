import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

const configSchema = z.object({
  port: z.coerce.number().default(4000),
  qdrant: z.object({
    url: z.string(),
    apiKey: z.string().optional(),
  }),
  gemini: z.object({
    apiKey: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;

export const loadConfig = () =>
  configSchema.parse({
    port: process.env.SERVER_PORT,
    qdrant: {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    },
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
    },
  });
