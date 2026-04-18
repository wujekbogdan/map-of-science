# @map-of-science/web

## 1.19.0

### Minor Changes

- e736905: Add LLM-generated cluster names

### Patch Changes

- 7f733cb: - Split test into `test:unit` / `test:integration`.
  - Add `typecheck` script.
  - Add `vitest.config.ts` with React config.
  - Upgrade `vitest` to `^4.0.15`, `vite` to `^7.2.6`, `react` to `^19.2.0`, `@vitejs/plugin-react-swc` to `^3.11.0`.
- fff35db: Update imports from `@map-of-science/csv` to `@map-of-science/parsers`
- Updated dependencies [7f733cb]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
  - @map-of-science/parsers@0.2.0

## 1.18.1

### Patch Changes

- 8ae6d4d: Install `vitest` directly instead of relying on the binary exposed by the `@map-of-science/vites` package.
- c7524b9: Update `Dockerfile` to work with the new monorepo structure and the global `docker-compose.yml` configuration.
- 9d8e6ba: Extract the CSV parser and related utilities into a separate `@map-of-science/csv` package.
- Updated dependencies [8ae6d4d]
- Updated dependencies [9d8e6ba]
  - @map-of-science/csv@0.1.0

## 1.18.0

### Minor Changes

- 9102bcd: Add _"About the Map of Science"_ modal, triggered by a button in the footer.
- 539e770: Translation updates:

  - Map entities: EN translations.
  - Various UI translation improvements.
  - General info: EN translation.

- be68559: Add logo
- c987fea: For clusters with an associated label, force label hover on cluster hover and vice versa.
- 9bb86d0: Define placeholder SCSS breakpoints and a set of React hooks: `useBreakpointMin`, `useBreakpointMax`, and
  `useBreakpointBetween` that utilize SCSS-exported variables.
- 21c7cb0: Add very basic mobile CSS.

### Patch Changes

- c6c89ad: Remove unintended background from header toggles on desktop.
- fb6c6a8: Prevent the "Check for Changesets" workflow from running on release PR creation.

## 1.17.0

### Minor Changes

- fc3a38e: Add missing UI translations. Rephrase some UI text.
- 0bbf913: Add language switcher UI.
- a646fc6: Extract named clusters from `areas.tsv` into a separate `places.tsv` file.
- 0bbf913: Drop props from the `Map` component and pull the data from the store instead.
- a646fc6: Make `places` act as `clusters` in terms of click and hover interactions.
- a646fc6: Rebrand `DataPoints` to `Clusters` across the codebase.
- bdfe4e2: Introduce new map mode toggle UI.
- 0bc3b17: Improve the search results UX by hiding regular clusters when a search filter is applied.
- 0bbf913: Replace the dummy `i18n` module with the `i18next` library, and add `pl-PL` and `en-US` translations for UI components.
- a646fc6: Enrich `clusters` with `places` data during model creation.
- 0bbf913: Localize area labels.

### Patch Changes

- 2f79b10: Adjusts the SVG background position and scale.
- 0bbf913: Drop duplicate `Vegetation, forests, fires` and `Tropical diseases` area data from tsv files.
- e284bfb: tsconfig include paths cleanup

## 1.16.0

### Minor Changes

- d41e81b: Introduce UUID-based IDs for all the labels. Move human-readable labels into an i18n file.
- c4c2b43: Add ability to toggle between the regular mode and the growth rating mode. Include a toggle to switch between modes in the top bar and make it configurable via the DevTools.
- c4c2b43: Add cluster count input to the top bar.
- c4c2b43: Add a top bar UI component.
- c4c2b43: Add a ripple effect to highlight search results.
- d41e81b: Add dates to the YT videos list and make minor list styling improvements.
- d41e81b: Remove the legacy `foreground.svg` file along with the Vite SVG parser plugin, and move all the data the plugin was extracting from the SVG file into a TSV file. Now, all the label data is rendered based on that file.

### Patch Changes

- d41e81b: Fix a bug that caused duplicate video items in the YT video list.

## 1.15.0

### Minor Changes

- 9000df8: Replace the old manually edited `foreground.svg` with a new SVG generated based on cluster data produced by an experimental Canvas map renderer. See:: https://github.com/wujekbogdan/map-of-science/pull/73

  The old `foreground.svg` image is still being used, but only as a source of label information.

- 8a327cc: Add the ability to select all data points that match the search query.
- d82eaab: Assign "Czytamy Naturę" YouTube videos to map labels.

### Patch Changes

- 96139e3: Fix a bug causing search results not to be unique.
- 74fd765: Move `typescript-plugin-css-modules` to the root `tsconfig.json` since plugins in referenced configs are not applied.
- 77f1557: Add `eslint` dependency explicitly due to the recently introduced `autoInstallPeers: false` setting in pnpm.

## 1.14.0

### Minor Changes

- 33a28a3: Add `vite-plugin-checker` to enable type checking in dev mode.

### Patch Changes

- 68136c3: Add `dist` to .gitignore and remove accidentally committed `dist` files.

## 1.13.0

### Minor Changes

- e86d99f:
  - Move the app from the root directory to the `src/apps/web` directory.
  - Rename the app to `@map-of-science/web`.
  - Extract the ESLint config into a separate `@map-of-science/eslint` package.
  - Extract the Vitest integration into a separate `@map-of-science/vitest` package.
  - Extract the TypeScript configs into a separate `@map-of-science/typescript` package.

## 1.12.0

### Minor Changes

- 1f85191:
  - Highlight query substring in search results dropdown.
  - Bump search results limit to 300.
  - Order data point search results by cluster count.
  - Add loading state indicator to search.
  - Memoize search results dropdown.

### Patch Changes

- a87c7de: Public URL update from `/map_of_science` to `/map-of-science/`.

## 1.11.0

### Minor Changes

- 14edc86: Migrate from `npm` to `pnpm`
- b3f8027: Drop JS-specific ESLint rules and simplify ESLint config

### Patch Changes

- e846889: Bump `react` and `react-dom` to version `19.1.0`.
- f98871c: Add GitHub links to the vast majority of TODOs in the code.
- 14edc86: Add a missing `comlink` dependency
- b3f8027: Bump `eslint-config-prettier"` to `10.1.5`

## 1.10.0

### Minor Changes

- 6e92d4e: Restore data points colour change on hover
- 2c96369: Restore data points fade in on zoom
- e673394: Drop the last legacy JS code dependency by removing point.js, which also lets us drop the event bus in favor of a more declarative approach using React state and SWR.
- 3888e26: Add the ability to search by data point keywords.
- 3888e26: Multiple performance improvements:

  - Replace several `.filter()` loops with regular `for` loops to allow breaking the loop early when the threshold is hit.
  - Replace `DataPoint` `styled-components` with (S)CSS modules.
  - Replace multiple `DataPoint` instances with a single `DataPoints` component rendering all data points in a single loop.
  - Replace `DataPoint` dynamically generated SVG attributes with a CSS-based solution using CSS `calc()`.
  - Simplify `DataPoint` shape generation by using a single shape for all data points, regardless of the article count.

### Patch Changes

- 10475f7: Reimplement `article.js` in TypeScript.
- 3888e26: Fix a bug causing the parsed map inline styles to include a `-` separator that's incompatible with React - use camelCased CSS properties instead.
- 6e92d4e: Adjust data point tooltip position dynamically to prevent overflow.
- 10475f7: Move all the components to the `components` directory.

## 1.9.0

### Minor Changes

- 0f9ec6c: Install the `@trivago/prettier-plugin-sort-imports` plugin and reformat all the files.
- a340b90: Run build, test, and lint on every push and pull request.

### Patch Changes

- 199871f: Restore the background color while loading the map.
- 11abdc2: bump `@vitejs/plugin-react-swc` to `3.9.0`
- 11abdc2: Bump `vite` to `6.3.5`
- 11abdc2: bump `vitest` to `3.1.3`
- 0f9ec6c: Add `*.ts` and `*.tsx` files to lint-staged configuration to run `prettier` and `eslint` on them.

## 1.8.1

### Patch Changes

- 820bd2b: Fix the styling of the article close button and the zoom controls button.
- 6054aac: restore the `isArticleAvailable()` function

## 1.8.0

### Minor Changes

- e7497a2: Port articles rendering to React
- e7497a2: Add ability to control the number of data points rendered with DevTools
- e7497a2: Port data points rendering to React

## 1.7.0

### Minor Changes

- 2a74b69: - Introduce strongly-typed `keys.tsv`, `data.tsv`, and `labels.tsv"` files parsing.
  - Refactor `points.js` to use th newly introduced parser
- b60bc77: Bring back CSV parsing with Web Workers.
- 91bb5f0: Add an `onClick` handler to map labels. The handler triggers only if the label has a corresponding article.
  This feature _DOES NOT_ bring back articles.
- 3e54b12: Drop the `streaming-tsv-parser.js` CSV parser:

  - Add a generic `csv` parser based on [`csv-parse`](https://www.npmjs.com/package/csv-parse).
  - Use the new parser in `points.js`.

  _Notice_: The new implementation doesn't use Web Workers. This is temporary and will be implemented using Comlink.

### Patch Changes

- b60bc77: Fixed the cities svg behaviour to resize when the window is resized.
- 91bb5f0: Fix a bug causing `VITE_BASE_URL` to be resolved as `undefined` in `vite.config.ts` if the variable was set via an `.env*` file.
  The Vite config now instantiates `dotenv` and parses `.env*` files.

## 1.6.0

### Minor Changes

- 5eff12f: Sync with the original repo. https://github.com/dsonyy/map_of_science/commit/6fd6a437b25c3b35626e03a3991eb6c2e2658722

  - Sync `assets/foreground.svg` https://github.com/dsonyy/map_of_science/commit/b157848365fbbc2aec3c257ab804ca459b6ef1b5
  - Sync `src/articles/fotonika.md` https://github.com/dsonyy/map_of_science/commit/6fd6a437b25c3b35626e03a3991eb6c2e2658722
  - Port Layer 4 labels rendering to React

### Patch Changes

- 5e525e5: Disable search input auto-focus. It’s bad UX because auto-focused input prevents the map's scroll event from working.
- 207fba3: Add a missing `vite-plugin-comlink` dependency

## 1.5.0

### Minor Changes

- 8ee6329:
  - Sync `assets/foreground.svg` with the original repo. https://github.com/dsonyy/map_of_science/commit/d05b22079ddb21a6b87008f999209e7cc0a5ac42
  - Sync `asset/labels.tsv` with the original repo. https://github.com/dsonyy/map_of_science/commit/3c61c313d16cfd1db049acc94d8c1a946e2a89ee
- 8ee6329:
  - Add a search feature. The typeahead search allows users to search through all the map labels. It zooms in and pans the map to the selected label's bounding box.
  - Add plus/minus zoom controls.

## 1.4.0

### Minor Changes

- bb5288f:
  - Drop the original labels implementation that rendered the labels outside the map SVG as absolutely positioned elements.
  - Re-implement the functionality with React, rendering labels within the SVG to simplify positioning and enable dynamic styling.
- 0107cde: Add a Dev Tools widget for dynamic label size adjustment. The widget is disabled by default. To enable it, set the `VITE_DEV_TOOL_ENABLED` environment variable to `true`.

### Patch Changes

- bb5288f: Fix Vite config bugs caused by a non-standard project `root` setting:

  - Set `envDir` to `../`
  - Set `build.outDir` to `../dist`

- bb5288f: Sync `assets/foreground.svg` with the original repo.
  https://github.com/dsonyy/map_of_science/commit/541e0d48131da5564beca1b5748b69138fa8dea4

## 1.3.0

### Minor Changes

- 21717bb:
  - Drop the `vite-plugin-svgr` Vite plugin.
  - Add a Vite plugin `vite-plugin/svg-map-parser` that:
    - Provides a custom loader for SVG files. Files loaded with the `?parse` query parameter are parsed by the plugin.
      Usage: `import map from './map.svg?parse'`.
    - Defines the schema for the SVG map.
    - Parses the given SVG file and validates it against the schema.
    - Returns a strongly typed object with the map data.
  - Add a React-rendered map that utilizes the `vite-plugin/svg-map-parser` plugin. This will allow us to use a
    declarative approach for SVG manipulation rather than direct DOM manipulation. The map is rendered as an SVG element that
    is (mostly) backwards compatible with the previous implementation. The only difference is that the custom
    `inkscape:label` attribute has been replaced with the standard `data-label` attribute.
  - Add [Vitest](https://vitest.dev/).

## 1.2.0

### Minor Changes

- e4836e2: Add Markdown support for articles.

## 1.1.1

### Patch Changes

- 7cb2ad5: Restore the `ArticleListGeneratorPlugin` plugin functionality using [Vite Glob import](https://vite.dev/guide/features#glob-import).

## 1.1.0

### Minor Changes

- 9aad3f6:
  - Add React + TypeScript + Vite
  - Merge the existing ESLint config with the default Vite config to ensure backward compatibility with the existing ESLint rules.
  - Wrap the existing JavaScript code in a React component to enable an incremental migration of the codebase to TypeScript.
  - Replace Webpack with SWC (used by Vite under the hood).
    - Remove the `ArticleListGeneratorPlugin` Webpack plugin and temporarily disable the `ArticleListGenerator` feature.

### Patch Changes

- 1cd925f: Remove a bunch of unused packages from `package.json`:

  - autoprefixer
  - csv-loader
  - eslint-config-prettier
  - eslint-config-standard
  - eslint-plugin-import
  - eslint-plugin-n
  - eslint-plugin-promise
  - postcss-loader
  - sass
  - sass-loader
  - style-loader
  - @d3fc/d3fc-annotation
  - @popperjs/core
  - bootstrap
  - d3-interpolate
  - d3-svg-annotation
  - lodash
  - mini-css-extract-plugin
  - svg-injector

- 19cf5a2: Turn the Release GitHub Workflow into a manually triggered one.
- b9dad5d:
  - Add `Dockerfile`
  - Add `docker-compose.yml`
  - Add corresponding instructions to `README.md`

## 1.0.1

### Patch Changes

- 2b221e6: Update Prettier setup:

  - Run `prettier --write .` via pre-commit hook.
  - Format `package.json` and `*.md` files with Prettier.

  Update ESLint setup:

  - Add the `--fix` flag to the pre-commit hook.

- 6b09a07:
  - Add [commitlint](https://commitlint.js.org/) together with [@commitlint/config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional)
  - Add [Commitizen](https://www.npmjs.com/package/commitizen)
- 753231f: Make the Node.js version explicit by:

  - Updating the `README.md` with the required Node.js version.
  - Specifying the Node.js version in `.nvmrc`.
  - Specifying the Node.js version in `package.json` via the `engines` field.

- 492ea49: Add a GitHub workflow that applies changesets and makes a release on push to `main`.
- 906b33a: Add [Changesets](https://github.com/changesets/changesets)
- 7e5077f: Add node version to `.nvmrc`
