import { z } from "zod";

declare global {
  interface Window {
    /**
     * Runtime override for build-time `VITE_*` config values. Absent keys
     * fall back to `import.meta.env`; empty strings do not fall back and
     * fail schema validation instead.
     */
    __APP_CONFIG__?: { apiUrl?: string; devTool?: string };
  }
}

const configSchema = z.object({
  apiUrl: z.string().url(),
  devTool: z.coerce.boolean().default(false),
  namespace: z.string().default("10b3c450-44d5-42f0-9fda-31000717d0fb"),
  LANG: z.string().default("pl-PL"), // TODO: make dynamic based on user language preference
});

const runtime = window.__APP_CONFIG__;

export const config = configSchema.parse({
  apiUrl: runtime?.apiUrl ?? import.meta.env.VITE_API_URL,
  devTool: runtime?.devTool ?? import.meta.env.VITE_DEV_TOOL_ENABLED,
});
