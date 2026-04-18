# @map-of-science/api

## 0.3.0

### Minor Changes

- 9f59ca4: Return cluster positions in screen-space (y-down). `cluster.viewport` now accepts a screen-space bbox and flips to natural internally.
- 7d54d51: - Accept optional `minScore` on `search.query`
- 0fe48aa: Add `displayName` fallback chain and `keyConcepts` to cluster responses

### Patch Changes

- 790b1b0: Document `present()` mappers. Rename internal `localizeArea` to `present` for cross-entity mapper consistency.
- c9e5bbd: Add `content.byArea` procedure.
- Updated dependencies [0fe48aa]
- Updated dependencies [c9e5bbd]
- Updated dependencies [88fe63f]
- Updated dependencies [7d54d51]
- Updated dependencies [7d54d51]
- Updated dependencies [88fe63f]
- Updated dependencies [0fe48aa]
- Updated dependencies [790b1b0]
- Updated dependencies [c9e5bbd]
- Updated dependencies [9f59ca4]
  - @map-of-science/atlas@0.3.0
  - @map-of-science/atlas-store@0.3.0
  - @map-of-science/embeddings@0.1.1

## 0.2.0

### Minor Changes

- 6f522d7: Add the tRPC router for the backend API.

### Patch Changes

- Updated dependencies [6f522d7]
- Updated dependencies [6f522d7]
  - @map-of-science/atlas-store@0.2.0
  - @map-of-science/atlas@0.2.0
