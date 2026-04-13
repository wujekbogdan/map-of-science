# @map-of-science/cli

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
