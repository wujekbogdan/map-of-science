---
"@map-of-science/atlas": minor
---

- Remove `id` from `clusterInputSchema`.
- Add the rich ETO fields to `Cluster`: `averageArticleAgeYears`, `citationRating`, `patentRating`, `topJournals`, `topInstitutions`, `topCompanies`, `articles` and `relatedClusters`.
- Name a related cluster by `externalId`.
- Limit `growthRating`, `citationRating` and `patentRating` to 0-100.
