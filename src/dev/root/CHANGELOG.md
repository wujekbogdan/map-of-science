# @map-of-science/root

## 0.3.0

### Minor Changes

- 815ac5e: Move render.com config to the `render.yaml` file.

## 0.2.0

### Minor Changes

- 6e6822e: Add a GitHub Action to verify whether at least one `.changesets/*.md` file is present for an open PR.

## 0.1.0

### Minor Changes

- 77f1557: Set the `autoInstallPeers: false` pnpm setting to enforce the explicit installation of peer dependencies.
- 38e199d: Create a dummy `@map-of-science/root` package as a workaround for Changesets to hold the changelog of the monorepo root package.

### Patch Changes

- c92943d: Drop the root ESLint config. It's no longer needed thanks to the `unstable_config_lookup_from_file` ESLint flag applied earlier.
