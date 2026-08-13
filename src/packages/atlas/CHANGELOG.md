# @map-of-science/atlas

## 0.5.0

### Minor Changes

- ceccd20: - Remove `id` from `clusterInputSchema`.
  - Add the rich ETO fields to `Cluster`: `averageArticleAgeYears`, `citationRating`, `patentRating`, `topJournals`, `topInstitutions`, `topCompanies`, `articles` and `relatedClusters`.
  - Name a related cluster by `externalId`.
  - Limit `growthRating`, `citationRating` and `patentRating` to 0-100.
- 59516c3: - Add `rankRelatedClusters`. It joins a cluster's two citation lists into one list, the strongest link first.
  - Add `findByExternalIds` to `ClusterRepository`.

## 0.4.0

### Minor Changes

- f98de5b: - Export `SortValue`, `sortValueSchema`, and `DEFAULT_SORT`
  - Accept an optional `sort` on `Search.query` and re-rank vector results in memory to apply the requested order

### Patch Changes

- 5b8bea3: - Bump `typescript` to `~6.0.3`.
  - Bump `@types/node` to `^22.19.17`.

## 0.3.1

### Patch Changes

- 4c34142: - Bump `vitest` to `^4.1.5`.

## 0.3.0

### Minor Changes

- 0fe48aa: Add `keyConcepts` field to cluster schema
- 7d54d51: - Add optional `minScore` to `Search.query`
  - Make `minScore` required on `ClusterRepository.findByVector`

### Patch Changes

- 88fe63f: bump `zod` to `^4.3.6` and migrate to v4 API:

  - `z.string().url()` → `z.url()`
  - `z.string().datetime()` → `z.iso.datetime()`
  - `ZodSchema<T, ZodTypeDef, unknown>` → `ZodType<T, unknown>`

- 790b1b0: Document schemas and interfaces. Add package README. Remove orphan `position.ts`.
- c9e5bbd: Add `findByAreaId(areaId)` to `ContentRepository`.
- 9f59ca4: Add `positionSchema` documenting the cluster coord convention (y-up natural).

## 0.2.0

### Minor Changes

- 6f522d7: Add the core domain package: schemas, repository interfaces, and search orchestration for Cluster, Area, and ContentItem aggregates.
