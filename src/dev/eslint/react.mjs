import jsEslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tsEslint from "typescript-eslint";

export const defineConfig = (...configs) =>
  tsEslint.config(
    jsEslint.configs.recommended,
    tsEslint.configs.recommendedTypeChecked,
    tsEslint.configs.stylisticTypeChecked,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    reactHooks.configs["recommended-latest"],
    reactRefresh.configs.recommended,
    reactRefresh.configs.vite,
    {
      ignores: ["dist"],
    },
    {
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: import.meta.dirname,
          projectService: true,
        },
        ecmaVersion: 2020,
        globals: globals.browser,
      },
      settings: {
        react: {
          version: "detect",
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
