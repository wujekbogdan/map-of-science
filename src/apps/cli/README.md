# @map-of-science/cli

CLI for map-of-science operations.

## Configuration

The CLI supports both environment variables and `.env` file placed in the directory from which the binary is executed.

| Variable            | Required | Description                           |
| ------------------- | -------- | ------------------------------------- |
| `GOOGLE_API_KEY`    | Yes      | Gemini API key                        |
| `QDRANT_URL`        | Yes      | Qdrant server URL                     |
| `QDRANT_API_KEY`    | No       | Qdrant API key (if auth enabled)      |
| `QDRANT_COLLECTION` | No       | Collection name (default: `clusters`) |
| `GEMINI_RPM`        | No       | Gemini rate limit (default: 10)       |

## CLI Reference

```
Usage: cli [options] [command]

CLI for map-of-science operations

Options:
  -h, --help       display help for command

Commands:
  embed [options]           Embed clusters from NDJSON file into vector store
  search [options] <query>  Search clusters using vector similarity
  name [options]            Generate names for clusters using LLM
  scrape-eto [options]      Scrape article titles from ETO cluster PDFs to NDJSON
  ingest:areas [options]    Ingest areas (tiers 1-3) from TSV files into Qdrant
  ingest:content [options]  Ingest YouTube segments as ContentItems into Qdrant
  ingest:clusters [options] Ingest clusters (embeddings + positions + names) into Qdrant
  help [command]            display help for command
```

## Ingestion

Full-population sequence (commands are independent; run in any order):

<!-- TODO: asset paths below point at `src/apps/web/asset/` because the web app
currently parses these TSVs at runtime. Once the frontend is wired to the API,
the raw data moves out of the web package and these paths need updating. -->

```bash
cli ingest:areas \
  --areas   src/apps/web/asset/areas.tsv \
  --i18n    src/apps/web/asset/map_entities_i18n.tsv

cli ingest:content \
  --input   src/apps/web/asset/youtube.tsv

# Clusters embeds via Gemini. Requires ETO NDJSON from `cli scrape-eto`.
cli ingest:clusters \
  --eto-input src/apps/web/asset/eto.ndjson \
  --clusters  src/apps/web/asset/clusters.tsv \
  --names     src/apps/web/asset/cluster_names_i18n.tsv \
  --places    src/apps/web/asset/places.tsv \
  --entities  src/apps/web/asset/map_entities_i18n.tsv
```

### embed

```
Usage: cli embed [options]

Embed clusters from NDJSON file into vector store

Options:
  -i, --input <path>          Path to clusters NDJSON file
  -s, --start <number>        Start index (0-based)
  -l, --limit <number>        Number of clusters to process
  -m, --max-titles <number>   Max titles per cluster
  -h, --help                  display help for command
```

Each cluster produces a **titles** vector - an embedding of concatenated article titles.

### search

```
Usage: cli search [options] <query>

Search clusters using vector similarity

Arguments:
  query                    Search query text

Options:
  -v, --vector <names>     Vector(s) to search (default: "titles")
  -f, --fusion <strategy>  Strategy for combining multiple vectors
  -w, --weights <ratio>    Importance ratio for weighted fusion (e.g., 3:1)
  -l, --limit <n>          Result limit (default: "10")
  -h, --help               display help for command
```

#### Single Vector Search

Search using one vector (default behavior):

```bash
cli search "quantum computing"
cli search "quantum computing" --vector titles
```

#### Multi-Vector Search

Combine multiple vectors. Requires `--fusion` to specify how results are merged:

```bash
cli search "quantum computing" --vector titles,concepts --fusion rrf
cli search "quantum computing" --vector titles,concepts --fusion score-fusion
cli search "quantum computing" --vector titles,concepts --fusion weighted --weights 3:1
```

#### Fusion Strategies

When searching multiple vectors, each returns a ranked list of results. Fusion combines these into a single ranking:

| Strategy   | Aliases        | Description                                                            |
| ---------- | -------------- | ---------------------------------------------------------------------- |
| `rrf`      | `rank-fusion`  | Combines by position in each list, ignoring similarity scores.         |
| `dbsf`     | `score-fusion` | Combines normalized similarity scores. Use when scores are meaningful. |
| `weighted` | N/A            | Custom weight per vector. Requires `--weights`.                        |

**Weights** are specified as a ratio matching vector count (e.g., `3:1` for 2 vectors).

### name

```
Usage: cli name [options]

Generate names for clusters using LLM

Options:
  -i, --input <path>          Path to clusters NDJSON file
  -s, --start <number>        Start index (0-based)
  -l, --limit <number>        Number of clusters to process
  -m, --max-titles <number>   Max titles per cluster
  -h, --help                  display help for command
```

### scrape-eto

```
Usage: cli scrape-eto [options]

Scrape article titles from ETO cluster PDFs to NDJSON

Options:
  -i, --input <path>    Directory containing cluster_*.pdf files
  -o, --output <path>   Output NDJSON file path
  -s, --start <number>  Starting cluster ID
  -l, --limit <number>  Number of clusters to process
  -h, --help            display help for command
```
