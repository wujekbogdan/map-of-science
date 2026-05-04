# @map-of-science/api

## 0.3.1

### Patch Changes

- 9da1468: - Render unnamed clusters as `Cluster #N` (en_US) / `Klaster #N` (pl_PL) in `displayName` instead of joining `keyConcepts`.
- dd6d4e7: - Widen `HttpRequest.headers` to `Record<string, string | string[] | undefined>` so it accepts Node's `IncomingHttpHeaders`
  - Coerce array values in the `x-lang` request header read by `createContext` (first element wins)
- 4c34142: - Bump `vitest` to `^4.1.5`.
- d12114c: - Read request language from the `x-lang` header (`en_US` or `pl_PL`); fall back to `en_US` on missing or unsupported value instead of throwing.
- Updated dependencies [4c34142]
  - @map-of-science/atlas@0.3.1
  - @map-of-science/atlas-store@0.3.1
  - @map-of-science/embeddings@0.1.2

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
