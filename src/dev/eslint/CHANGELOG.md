# @map-of-science/eslint

## 0.2.0

### Minor Changes

- 77f1557: Drop the `bin` entry from the `package.json`. It's no longer needed since the `autoInstallPeers: false` pnpm setting forces ESLint to be explicitly installed by packages that rely on `@map-of-science/eslint`.

## 0.1.1

### Patch Changes

- 4235a13: Make `eslint` a peer dependency.

## 0.1.0

### Minor Changes

- e86d99f: Extract the ESLint config into a separate `@map-of-science/eslint` package.
