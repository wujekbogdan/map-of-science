---
"@map-of-science/api": minor
---

- Return `id`, `externalId`, `position`, `displayName`, `articlesCount`, `growthRating` and `keyConcepts` from `cluster.viewport` and `search.query`.
- Return the same fields from `cluster.byId`, plus `name`, `averageArticleAgeYears`, `citationRating`, `patentRating`, `topJournals`, `topInstitutions`, `topCompanies`, `articles` and `rankedRelatedClusters`.
- Stop sending `nameSource`, `embedding`, raw `relatedClusters`, `score` and `significantCitations`.
- Delete the `cluster.byIds` procedure.
- Add `MapCluster`, `ClusterDetails` and `RelatedCluster` for the three shapes above.
- Name every field a procedure returns, so a new field on the cluster no longer reaches the browser on its own.
