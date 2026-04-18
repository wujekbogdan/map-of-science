import { defineNodeConfig } from "@map-of-science/tsdown";

export default defineNodeConfig({
  // CJS for pkg compatibility - pkg doesn't support ESM
  format: "cjs",
  // Custom name for pkg output (pkg uses entry filename for executable names)
  entry: { "mos-cli": "./src/index.ts" },
});
