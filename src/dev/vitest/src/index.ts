import { defineConfig } from "vitest/config";

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
          },
        },
      ],
    },
  });
