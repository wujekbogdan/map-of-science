# @map-of-science/eslint

## 0.4.2

### Patch Changes

- 5b8bea3: - Bump `typescript-eslint` to `^8.59.1`.
  - Set Node baseline to `22.22.2` for `n/no-unsupported-features`.

## 0.4.1

### Patch Changes

- 4c34142: - Bump `eslint` to `^9.39.4`.

## 0.4.0

### Minor Changes

- 7f733cb: - Support custom config via `configs` param.
  - Fix node config globals (`browser` -> `node`).
  - Add `tsconfigRootDir` for type-aware linting.
  - Add `eslint-plugin-react` with `jsx-runtime` support.
  - Add React version detection.

## 0.3.0

### Minor Changes

- c7524b9: Introduce a new ESLint config for Node.js apps. It's based on the existing ESLint but stripped of React-specific rules, with `eslint-plugin-n` rules added.
- 8ae6d4d: Add the `vitest.config.ts` file to ignore list.
- c7524b9: Add config for Node.js

## 0.2.0

### Minor Changes

- 77f1557: Drop the `bin` entry from the `package.json`. It's no longer needed since the `autoInstallPeers: false` pnpm setting forces ESLint to be explicitly installed by packages that rely on `@map-of-science/eslint`.

## 0.1.1

### Patch Changes

- 4235a13: Make `eslint` a peer dependency.

## 0.1.0

### Minor Changes

- e86d99f: Extract the ESLint config into a separate `@map-of-science/eslint` package.
