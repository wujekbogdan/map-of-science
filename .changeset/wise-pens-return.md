---
"@map-of-science/eto-cluster-parser": major
---

- Rename from `@map-of-science/eto-pdf-parser` to `@map-of-science/eto-cluster-parser`. `parseClusterPdf(bytes)` becomes `parseCluster(record)`.
- Parse ETO `cluster_details` JSONL records, the structured data the PDFs were rendered from, instead of the PDFs.
- Parse `averageArticleAgeYears`, `citationRatingPercentile`, `patentRatingPercentile`, per-article `metadata`/`citations`/`doi`, `topJournals`, `topInstitutions`, `topCompanies`, and `relatedClusters`.
