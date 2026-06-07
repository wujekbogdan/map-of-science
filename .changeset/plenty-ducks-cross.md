---
"@map-of-science/eto-pdf-parser": minor
---

Add parsed-result fields: `averageArticleAgeYears`, `citationRatingPercentile`, `patentRatingPercentile`, `topJournals`, `topInstitutions`, `topCompanies`, `relatedClusters`.

Replace each `core` / `review` / `highlyCited` article (was a title string) with `{ title, metadata, citations, doi }`.
