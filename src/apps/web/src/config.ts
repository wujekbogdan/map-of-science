import { z } from "zod";

const configSchema = z.object({
  apiUrl: z.string().url(),
  devTool: z.coerce.boolean().default(false),
  namespace: z.string().default("10b3c450-44d5-42f0-9fda-31000717d0fb"),
  LANG: z.string().default("pl-PL"), // TODO: make dynamic based on user language preference
});

export const config = configSchema.parse({
  apiUrl: import.meta.env.VITE_API_URL,
  devTool: import.meta.env.VITE_DEV_TOOL_ENABLED,
});
