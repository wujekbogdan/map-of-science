# @map-of-science/atlas

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
