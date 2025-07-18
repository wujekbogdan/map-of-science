# @map-of-science/root

## 0.5.0

### Minor Changes

- 9d8e6ba: Add a new `packages` pnpm workspace.
- 8ae6d4d: Removed the `"outputs"` entry from the `test` task - it was never meant to be there.
- c7524b9: Build Docker images via GitHub Actions on push.
- c7524b9: Add `docker-compose.yml` that supports the `@map-of-science/web` and `@map-of-science/api` apps.

### Patch Changes

- 7e844b2: Trigger the "CI" workflow on changesets-created PRs.

## 0.4.0

### Minor Changes

- fb6c6a8: Use `PERSONAL_ACCESS_TOKEN` instead of `GITHUB_TOKEN` in the "Release" GitHub workflow to allow the "CI" workflow to run when the "Release" PR is created.
- fb6c6a8: Remove the "Deploy to GitHub Pages" GitHub workflow. We don't use it anymore since we moved to render.com.

### Patch Changes

- c3f199c: Format `*.css` and `*.scss` files with Prettier.

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
