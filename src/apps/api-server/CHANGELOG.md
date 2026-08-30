# @map-of-science/api

## 0.2.6

### Patch Changes

- d5299dc: - Build the search service from `store.clusterAttributes` instead of `store.clusters`, which no longer holds `findByVector`.
- Updated dependencies [d5299dc]
- Updated dependencies [d5299dc]
- Updated dependencies [d5299dc]
  - @map-of-science/atlas@0.6.0
  - @map-of-science/atlas-store@0.5.0
  - @map-of-science/api@0.6.0

## 0.2.5

### Patch Changes

- Updated dependencies [ceccd20]
- Updated dependencies [59516c3]
- Updated dependencies [59516c3]
- Updated dependencies [ceccd20]
- Updated dependencies [59516c3]
  - @map-of-science/atlas@0.5.0
  - @map-of-science/api@0.5.0
  - @map-of-science/atlas-store@0.4.0

## 0.2.4

### Patch Changes

- ad32a8b: - Publish a multi-arch Docker image to GHCR on release.

## 0.2.3

### Patch Changes

- 5b8bea3: - Bump `typescript` to `~6.0.3`.
  - Bump `@types/node` to `^22.19.17`.
  - Bump `tsdown` to `^0.21.10`.
  - Bump Docker base to `node:22.22.2-slim`.
- 25e0764: - Update Dockerfile `PATH` to include `$PNPM_HOME/bin`, where pnpm v11 writes its global binaries.
- Updated dependencies [f98de5b]
- Updated dependencies [f98de5b]
- Updated dependencies [5b8bea3]
  - @map-of-science/api@0.4.0
  - @map-of-science/atlas@0.4.0
  - @map-of-science/atlas-store@0.3.2
  - @map-of-science/embeddings@0.1.3

## 0.2.2

### Patch Changes

- 4c34142: - Bump `eslint` to `^9.39.4`.
- 4c34142: - Bump `vitest` to `^4.1.5`.
- Updated dependencies [9da1468]
- Updated dependencies [dd6d4e7]
- Updated dependencies [4c34142]
- Updated dependencies [d12114c]
  - @map-of-science/api@0.3.1
  - @map-of-science/atlas@0.3.1
  - @map-of-science/atlas-store@0.3.1
  - @map-of-science/embeddings@0.1.2

## 0.2.1

### Patch Changes

- 88fe63f: normalize `@trpc/server` (`11.16.0` → `^11.16.0`) and `dotenv` (`17.4.2` → `^17.2.3`) to caret ranges to align with the rest of the workspace
- Updated dependencies [0fe48aa]
- Updated dependencies [9f59ca4]
- Updated dependencies [c9e5bbd]
- Updated dependencies [88fe63f]
- Updated dependencies [7d54d51]
- Updated dependencies [7d54d51]
- Updated dependencies [88fe63f]
- Updated dependencies [7d54d51]
- Updated dependencies [0fe48aa]
- Updated dependencies [0fe48aa]
- Updated dependencies [790b1b0]
- Updated dependencies [c9e5bbd]
- Updated dependencies [9f59ca4]
- Updated dependencies [790b1b0]
- Updated dependencies [c9e5bbd]
  - @map-of-science/atlas@0.3.0
  - @map-of-science/api@0.3.0
  - @map-of-science/atlas-store@0.3.0
  - @map-of-science/embeddings@0.1.1

## 0.2.0

### Minor Changes

- 6f522d7: Rename from apps/api and wire up the tRPC HTTP server.

### Patch Changes

- Updated dependencies [6f522d7]
- Updated dependencies [6f522d7]
- Updated dependencies [6f522d7]
  - @map-of-science/atlas-store@0.2.0
  - @map-of-science/atlas@0.2.0
  - @map-of-science/api@0.2.0

## 0.1.1

### Patch Changes

- 7f733cb: - Switch build from `tsc` to `tsdown`.
  - Split test into `test:unit`/`test:integration`.
  - Add `typecheck` script.
  - Add `tsx` watch for dev.
  - Add `start` script.
  - Upgrade vitest to `^4.0.15`.

## 0.1.0

### Minor Changes

- c7524b9: Initialize a new `"@map-of-science/api"` Node.js app that does nothing at this point. It's just a template that compiles with TypeScript, and has ESLint and Vitest set up.
- c7524b9: Dockerize the app.

### Patch Changes

- 8ae6d4d: Install `vitest` directly instead of relying on the binary exposed by the `@map-of-science/vites` package.
