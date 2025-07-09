import { z } from "zod";

const ConfigSchema = z.object({
  devTool: z.enum(["true", "false"]).transform((val) => val === "true"),
  apiUrl: z.string().default("URL_NOT_SET"),
  LANG: z.string().default("pl-PL"),
});

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const config = ConfigSchema.parse({
  devTool: import.meta.env.VITE_DEV_TOOL_ENABLED,
  apiUrl: import.meta.env.VITE_API_URL,
  LANG: "pl-PL", // TODO: Make it dynamic based on the user language preference
});
