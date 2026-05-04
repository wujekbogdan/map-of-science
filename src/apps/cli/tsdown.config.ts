import { defineNodeConfig } from "@map-of-science/tsdown";

export default defineNodeConfig({
  // CJS for pkg compatibility - pkg doesn't support ESM
  format: "cjs",
  // Custom name for pkg output (pkg uses entry filename for executable names)
  entry: { "mos-cli": "./src/index.ts" },
  inputOptions: {
    onLog(level, log, defaultHandler) {
      // `bottleneck` uses `eval("require")` to keep optional `redis`/`ioredis`
      // out of bundlers. We never load those backends, so the warning is noise.
      if (log.code === "EVAL" && log.id?.includes("/bottleneck/")) return;
      defaultHandler(level, log);
    },
  },
});
