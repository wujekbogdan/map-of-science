# @map-of-science/vitest

## 0.4.2

### Patch Changes

- 5b8bea3: - Bump `typescript` to `~6.0.3`.
  - Add `@types/node` `^22.19.17`.
  - Set `rootDir` explicitly.

## 0.4.1

### Patch Changes

- 4c34142: - Bump `vitest` to `^4.1.5`.
- 4c34142: - Bump `@vitest/browser-playwright` to `4.1.5`.

## 0.4.0

### Minor Changes

- a1783d8: - Add browser test mode

## 0.3.0

### Minor Changes

- fff35db: Add integration test setup with `dotenv-mono` for `.env.test` loading
- 7f733cb: - Add `defineReactConfig()` with `happy-dom`.
  - Add `unit` + `integration` project separation.
  - Upgrade `vitest` to `^4.0.15`.

## 0.2.0

### Minor Changes

- 8ae6d4d: Define and export a node-specific config.

### Patch Changes

- 8ae6d4d: Removed the `bin` entry from `package.json`.
  Stopped re-exporting the `vitest` package.

## 0.1.0

### Minor Changes

- e86d99f: Extract the Vitest integration into a separate `@map-of-science/vitest` package.
