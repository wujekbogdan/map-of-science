import { defineConfig, type UserConfig } from "tsdown";

export const defineNodeConfig = (config?: UserConfig) =>
  defineConfig({
    entry: ["./src/index.ts"],
    platform: "node",
    deps: {
      alwaysBundle: [/.*/],
      onlyBundle: false,
    },
    ...config,
  });
