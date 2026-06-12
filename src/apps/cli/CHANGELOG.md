# @map-of-science/cli

## 1.1.0

### Minor Changes

- e43d891: - Re-enable the `scrape-eto` command. It parses the ETO `cluster_details` JSONL dataset into NDJSON.
  - Update the `name` and `ingest:clusters` commands to read the ETO NDJSON's object-shaped article entries.

### Patch Changes

- Updated dependencies [e43d891]
  - @map-of-science/eto-cluster-parser@1.1.0

## 1.0.0

### Major Changes

- d9cc921: Disable the `scrape-eto` command. It consumed the PDF parser, which has been replaced by a JSONL-based cluster parser that is not yet wired into the command.

### Patch Changes

- 5b8bea3: - Bump `typescript` to `~6.0.3`.
  - Bump `@types/node` to `^22.19.17`.
  - Bump `tsdown` to `^0.21.10`.
- 818b44c: - Silence rolldown EVAL warnings from `bottleneck`'s optional redis backends during build
- Updated dependencies [f98de5b]
- Updated dependencies [5b8bea3]
- Updated dependencies [d9cc921]
  - @map-of-science/atlas@0.4.0
  - @map-of-science/atlas-store@0.3.2
  - @map-of-science/cluster-embedder@0.2.2
  - @map-of-science/cluster-namer@0.1.2
  - @map-of-science/embeddings@0.1.3
  - @map-of-science/eto-cluster-parser@1.0.0
  - @map-of-science/logger@0.1.2
  - @map-of-science/openalex@0.1.3
  - @map-of-science/parsers@0.2.3
  - @map-of-science/rate-limiter@0.1.2
  - @map-of-science/text-generator@0.1.2
  - @map-of-science/package@0.1.2

## 0.2.2

### Patch Changes

- 4c34142: - Bump `eslint` to `^9.39.4`.
- 4c34142: - Bump `vitest` to `^4.1.5`.
- Updated dependencies [4c34142]
- Updated dependencies [4c34142]
  - @map-of-science/parsers@0.2.2
  - @map-of-science/atlas@0.3.1
  - @map-of-science/atlas-store@0.3.1
  - @map-of-science/cluster-embedder@0.2.1
  - @map-of-science/cluster-namer@0.1.1
  - @map-of-science/embeddings@0.1.2
  - @map-of-science/eto-pdf-parser@0.1.1
  - @map-of-science/logger@0.1.1
  - @map-of-science/openalex@0.1.2
  - @map-of-science/rate-limiter@0.1.1
  - @map-of-science/text-generator@0.1.1
  - @map-of-science/package@0.1.1

## 0.2.1

### Patch Changes

- 88fe63f: bump `zod` to `^4.3.6` to align with the rest of the workspace
- Updated dependencies [0fe48aa]
- Updated dependencies [c9e5bbd]
- Updated dependencies [88fe63f]
- Updated dependencies [7d54d51]
- Updated dependencies [7d54d51]
- Updated dependencies [88fe63f]
- Updated dependencies [0fe48aa]
- Updated dependencies [790b1b0]
- Updated dependencies [88fe63f]
- Updated dependencies [c9e5bbd]
- Updated dependencies [9f59ca4]
  - @map-of-science/atlas@0.3.0
  - @map-of-science/atlas-store@0.3.0
  - @map-of-science/parsers@0.2.1
  - @map-of-science/embeddings@0.1.1
  - @map-of-science/openalex@0.1.1

## 0.2.0

### Minor Changes

- 6f522d7: - Add ingest commands for clusters, areas, and content
  - Drop the embed command (superseded by ingest:clusters)
  - Drop fusion search from the search command

### Patch Changes

- Updated dependencies [6f522d7]
- Updated dependencies [6f522d7]
- Updated dependencies [6f522d7]
  - @map-of-science/atlas-store@0.2.0
  - @map-of-science/atlas@0.2.0
  - @map-of-science/cluster-embedder@0.2.0
  - @map-of-science/openalex@0.1.0
  - @map-of-science/parsers@0.2.0

## 0.1.0

### Minor Changes

- fff35db: Add CLI for cluster embedding, search, naming, and ETO PDF scraping.

  Commands:

  - `embed` - Embed cluster titles from NDJSON into Qdrant vector store
  - `search` - Query clusters using single or multi-vector similarity with fusion
  - `name` - Generate cluster names via LLM
  - `scrape-eto` - Extract article titles from ETO cluster PDFs to NDJSON

  Features:

  - Environment-based configuration with .env support
  - Rate-limited Gemini API calls
  - NDJSON streaming input/output

### Patch Changes

- Updated dependencies [7f733cb]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [7f733cb]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
- Updated dependencies [fff35db]
  - @map-of-science/parsers@0.2.0
  - @map-of-science/logger@0.1.0
  - @map-of-science/openalex@0.1.0
  - @map-of-science/vector-store@0.1.0
  - @map-of-science/rate-limiter@0.1.0
  - @map-of-science/package@0.1.0
  - @map-of-science/eto-pdf-parser@0.1.0
  - @map-of-science/text-generator@0.1.0
  - @map-of-science/cluster-namer@0.1.0
  - @map-of-science/cluster-embedder@0.1.0
  - @map-of-science/embeddings@0.1.0
