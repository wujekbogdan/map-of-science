import { defineConfig } from "vitest/config";

export const defineNodeConfig = () =>
  defineConfig({
    test: {
      environment: "node",
      include: ["src/**/*.spec.ts"],
    },
  });
