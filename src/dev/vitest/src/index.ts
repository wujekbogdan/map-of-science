import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const here = dirname(fileURLToPath(import.meta.url));

export const defineNodeConfig = () =>
  defineConfig({
    test: {
      passWithNoTests: true,
      projects: [
        {
          test: {
            name: "unit",
            environment: "node",
            include: ["src/**/*.spec.ts"],
            exclude: ["src/**/*.integration.spec.ts"],
          },
        },
        {
          test: {
            name: "integration",
            environment: "node",
            include: ["src/**/*.integration.spec.ts"],
            setupFiles: [resolve(here, "./setup.js")],
          },
        },
      ],
    },
  });

export const defineReactConfig = () =>
  defineConfig({
    test: {
      passWithNoTests: true,
      projects: [
        {
          test: {
            name: "unit",
            environment: "happy-dom",
            include: ["src/**/*.spec.{ts,tsx}"],
            exclude: ["src/**/*.integration.spec.{ts,tsx}"],
          },
        },
        {
          test: {
            name: "integration",
            environment: "happy-dom",
            include: ["src/**/*.integration.spec.{ts,tsx}"],
            setupFiles: [resolve(here, "./setup.js")],
          },
        },
      ],
    },
  });
