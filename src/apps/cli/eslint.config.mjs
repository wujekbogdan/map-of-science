import { defineNodeConfig } from "@map-of-science/eslint";

export default defineNodeConfig({
  files: ["src/index.ts"],
  rules: {
    "n/hashbang": "off",
  },
});
