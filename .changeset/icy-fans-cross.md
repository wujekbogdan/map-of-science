---
"@map-of-science/typescript": minor
---

- Add `tsconfig.base.json` with shared settings.
- Refactor `node/react` configs to extend base.
- Switch to `noEmit` + `Bundler` moduleResolution.
- Remove `declaration`/`outDir` (bundler handles output).
- Drop `vite` config export (node config now includes all `*.ts` files).
