import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { viteEnvs } from "vite-envs";
import checker from "vite-plugin-checker";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      checker({
        overlay: env.VITE_CHECKER_OVERLAY === "true",
        typescript: {
          root: "./",
          tsconfigPath: "tsconfig.react.json",
        },
      }),
      react(),
      svgr(),
      viteEnvs({
        declarationFile: "../.env.declaration",
        ambientModuleDeclarationFilePath: ({ appRootDirPath }) =>
          path.join(appRootDirPath, "vite-env.d.ts"),
      }),
    ],
    base: env.VITE_BASE_URL,
    root: "src",
    envDir: "../",
    build: {
      outDir: "../dist",
      emptyOutDir: true,
    },
    assetsInclude: ["src/articles/*.md"],
  };
});
