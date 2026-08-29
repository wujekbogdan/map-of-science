---
"@map-of-science/atlas": minor
---

- Add `clusterAttributesSchema` and `clusterAssociationsSchema`, which together hold every field of `clusterSchema`. `clusterSchema` keeps the same fields as before.
- Remove `findByIds`, `findByExternalIds`, `findInViewport` and `findByVector` from `ClusterRepository`, which now holds `createSchema`, `upsert` and `findById`.
- Add `ClusterAttributesReader` with `findByExternalIds`, `findInViewport` and `findByVector`.
- Add `ClusterMapAttributes`, a `Cluster` narrowed to `id`, `externalId`, `position`, `name`, `articlesCount`, `growthRating` and `keyConcepts`.
- Narrow `ClusterMatch` from a whole `Cluster` to `ClusterMapAttributes` plus `score`.
