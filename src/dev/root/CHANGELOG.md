# @map-of-science/root

## 0.1.0

### Minor Changes

- 77f1557: Set the `autoInstallPeers: false` pnpm setting to enforce the explicit installation of peer dependencies.
- 38e199d: Create a dummy `@map-of-science/root` package as a workaround for Changesets to hold the changelog of the monorepo root package.

### Patch Changes

- c92943d: Drop the root ESLint config. It's no longer needed thanks to the `unstable_config_lookup_from_file` ESLint flag applied earlier.
