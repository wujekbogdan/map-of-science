import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgMapParser from "./vite-plugin/svg-map-parser";
import { comlink } from "vite-plugin-comlink";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), svgMapParser(), comlink()],
    base: env.VITE_BASE_URL || "/",
    root: "src",
    envDir: "../",
    build: {
      outDir: "../dist",
      emptyOutDir: true,
    },
    worker: {
      plugins: () => [comlink()],
    },
    assetsInclude: ["src/articles/*.md"],
  };
});
