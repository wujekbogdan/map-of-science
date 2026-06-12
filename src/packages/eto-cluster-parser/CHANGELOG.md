# @map-of-science/eto-pdf-parser

## 1.1.0

### Minor Changes

- e43d891: Export the `ParsedCluster` type.

## 1.0.0

### Major Changes

- d9cc921: - Rename from `@map-of-science/eto-pdf-parser` to `@map-of-science/eto-cluster-parser`. `parseClusterPdf(bytes)` becomes `parseCluster(record)`.
  - Parse ETO `cluster_details` JSONL records, the structured data the PDFs were rendered from, instead of the PDFs.
  - Parse `averageArticleAgeYears`, `citationRatingPercentile`, `patentRatingPercentile`, per-article `metadata`/`citations`/`doi`, `topJournals`, `topInstitutions`, `topCompanies`, and `relatedClusters`.

### Patch Changes

- 5b8bea3: - Bump `typescript` to `~6.0.3`.
  - Bump `@types/node` to `^22.19.17`.

## 0.1.1

### Patch Changes

- 4c34142: - Bump `vitest` to `^4.1.5`.

## 0.1.0

### Minor Changes

- fff35db: Add ETO cluster PDF parser for extracting article titles
