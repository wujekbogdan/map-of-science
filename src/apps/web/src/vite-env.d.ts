/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEV_TOOL_ENABLED?: string;
  readonly VITE_CHECKER_OVERLAY?: string;
  readonly VITE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
