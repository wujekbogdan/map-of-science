# @map-of-science/atlas-store

## 0.4.0

### Minor Changes

- 59516c3: - Add `findByExternalIds`, to get clusters by their ETO id.
- ceccd20: - Make each cluster's point id from its `externalId`. The caller no longer gives an id.
  - Read and write the rich ETO cluster fields.
  - Map `citationRating` and `patentRating` to the stored `citationRatingPercentile` and `patentRatingPercentile`.
  - Map a related cluster's `externalId` to the stored `id`.

### Patch Changes

- Updated dependencies [ceccd20]
- Updated dependencies [59516c3]
  - @map-of-science/atlas@0.5.0

## 0.3.2

### Patch Changes

- 5b8bea3: - Bump `typescript` to `~6.0.3`.
  - Bump `@types/node` to `^22.19.17`.
- Updated dependencies [f98de5b]
- Updated dependencies [5b8bea3]
  - @map-of-science/atlas@0.4.0
  - @map-of-science/logger@0.1.2

## 0.3.1

### Patch Changes

- 4c34142: - Bump `vitest` to `^4.1.5`.
- Updated dependencies [4c34142]
  - @map-of-science/atlas@0.3.1
  - @map-of-science/logger@0.1.1

## 0.3.0

### Minor Changes

- 0fe48aa: Persist and read `keyConcepts` from Qdrant cluster payloads

### Patch Changes

- c9e5bbd: Index `area_ids` on `content_items` and add `findByAreaId`.
- 7d54d51: - Pass `minScore` to Qdrant's `score_threshold` in the clusters adapter
- Updated dependencies [0fe48aa]
- Updated dependencies [88fe63f]
- Updated dependencies [7d54d51]
- Updated dependencies [790b1b0]
- Updated dependencies [c9e5bbd]
- Updated dependencies [9f59ca4]
  - @map-of-science/atlas@0.3.0

## 0.2.0

### Minor Changes

- 6f522d7: Add Qdrant-backed implementations of the atlas repository interfaces.

### Patch Changes

- Updated dependencies [6f522d7]
  - @map-of-science/atlas@0.2.0
