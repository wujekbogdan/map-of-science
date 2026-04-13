# @map-of-science/api

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
