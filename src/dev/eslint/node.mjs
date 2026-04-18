import jsEslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import nodePlugin from "eslint-plugin-n";
import globals from "globals";
import tsEslint from "typescript-eslint";

export const defineConfig = (...configs) =>
  tsEslint.config(
    jsEslint.configs.recommended,
    tsEslint.configs.recommendedTypeChecked,
    tsEslint.configs.stylisticTypeChecked,
    nodePlugin.configs["flat/recommended-script"],
    {
      ignores: ["dist", ".eslint.config.mjs"],
    },
    {
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: import.meta.dirname,
          projectService: true,
        },
        ecmaVersion: 2020,
        globals: globals.node,
      },
      settings: {
        node: {
          version: "22.15.0",
        },
      },
    },
    {
      rules: {
        "@typescript-eslint/consistent-type-definitions": "off",
      },
    },
    {
      files: ["**/*.js", "**/*.mjs"],
      extends: [tsEslint.configs.disableTypeChecked],
    },
    ...configs,
    eslintConfigPrettier,
  );
