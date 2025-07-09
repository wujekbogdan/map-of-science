import { z } from "zod";

export const ConfigSchema = z.object({
  server: z.object({
    host: z.string().default("localhost"),
    port: z.coerce.number().default(3000),
  }),
  qdrant: z.object({
    host: z.string().default("localhost"),
    port: z.coerce.number().default(6333),
  }),
});

export const config = ConfigSchema.parse({
  server: {
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT,
  },
  qdrant: {
    host: process.env.QDRANT_HOST,
    port: process.env.QDRANT_PORT,
  },
});
