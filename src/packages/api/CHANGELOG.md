# @map-of-science/api

## 0.6.0

### Minor Changes

- d5299dc: - Return `id`, `externalId`, `position`, `displayName`, `articlesCount`, `growthRating` and `keyConcepts` from `cluster.viewport` and `search.query`.
  - Return the same fields from `cluster.byId`, plus `name`, `averageArticleAgeYears`, `citationRating`, `patentRating`, `topJournals`, `topInstitutions`, `topCompanies`, `articles` and `rankedRelatedClusters`.
  - Stop sending `nameSource`, `embedding`, raw `relatedClusters`, `score` and `significantCitations`.
  - Delete the `cluster.byIds` procedure.
  - Add `MapCluster`, `ClusterDetails` and `RelatedCluster` for the three shapes above.
  - Name every field a procedure returns, so a new field on the cluster no longer reaches the client on its own.

### Patch Changes

- Updated dependencies [d5299dc]
- Updated dependencies [d5299dc]
  - @map-of-science/atlas@0.6.0
  - @map-of-science/atlas-store@0.5.0

## 0.5.0

### Minor Changes

- 59516c3: - Return `rankedRelatedClusters` from `cluster.byId`. Each link carries a name.
  - Set a link's cluster id to null in `rankedRelatedClusters` when the cluster is not stored.

### Patch Changes

- Updated dependencies [ceccd20]
- Updated dependencies [59516c3]
- Updated dependencies [ceccd20]
- Updated dependencies [59516c3]
  - @map-of-science/atlas@0.5.0
  - @map-of-science/atlas-store@0.4.0

## 0.4.0

### Minor Changes

- f98de5b: - Accept an optional `sort` on `search.query` input as a `relevance | articlesCount.{asc,desc}` discriminated union, defaulting to `relevance`

### Patch Changes

- 5b8bea3: - Bump `typescript` to `~6.0.3`.
  - Bump `@types/node` to `^22.19.17`.
- Updated dependencies [f98de5b]
- Updated dependencies [5b8bea3]
  - @map-of-science/atlas@0.4.0
  - @map-of-science/atlas-store@0.3.2
  - @map-of-science/embeddings@0.1.3

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
