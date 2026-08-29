---
"@map-of-science/atlas-store": minor
---

- Store a cluster in two Qdrant collections under the same point id: `clusters` holds `externalId`, `position`, `name`, `articlesCount`, `growthRating`, `averageArticleAgeYears`, `citationRating`, `patentRating` and `keyConcepts`, and a new `cluster_associations` holds `topJournals`, `topInstitutions`, `topCompanies`, `articles`, `relatedClusters`, `nameSource` and `embedding`.
- Add `createClusterAttributesReader`, reachable on `createAtlasStore` as `clusterAttributes`, with `findByExternalIds`, `findInViewport` and `findByVector`.
- Fetch only the payload keys a read needs instead of the whole point payload.
- Read both collections concurrently in `findById` and merge them into one cluster.
- Remove `findByIds`, `findByExternalIds`, `findInViewport` and `findByVector` from `createClustersRepository`.
