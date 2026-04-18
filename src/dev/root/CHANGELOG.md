# @map-of-science/root

## 0.7.1

### Patch Changes

- 60ebcb2: - Cache turbo tasks in CI
- 100a3ec: Run services from Frankfurt so the api sits close to the database
- 4dbde08: Add `prepare` script so husky auto-installs git hooks on `pnpm install`
- c9e94df: - Add api-server service to Render blueprint
  - Pin prod static to main and point dev services at develop

## 0.7.0

### Minor Changes

- 6f522d7: - Add api-server and qdrant services to docker-compose
  - Add `.dockerignore`
  - Update CI workflow for api → api-server rename
  - Document the full data pipeline and full-stack docker compose in the README

## 0.6.0

### Minor Changes

- 7f733cb: - Split test into `test:unit` and `test:integration`.
  - Add scaffolding scripts (`create:package`, `create:react-app`, `create:node-app`).
  - Add `@manypkg/cli` with `deps:check` and `deps:fix` scripts.
  - Update `turbo.json` pipelines accordingly.
  - Add `src/examples/*` to pnpm workspace.
- fff35db: Configure integration test infrastructure.

  - Add `passThroughEnv` for Docker, Google, and OpenAlex env vars in `turbo.json`
  - Add `.env.test.example` with required integration test env vars
  - Pass API secrets (Google, OpenAlex) to CI workflow
  - Add `.env*` to `.gitignore`

- fff35db: Change turbo ui mode from `tui` to `stream`.
- f6821b2: Temporarily restore Github Pages deployment

### Patch Changes

- eae0226: Add a missing `VITE_BASE_URL` environment variable to the Github Pages deployment workflow.
- fff35db: Add `typecheck` workspace command

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
