# @map-of-science/cli

CLI for map-of-science operations.

## Configuration

The CLI supports both environment variables and `.env` file placed in the directory from which the binary is executed.

| Variable            | Required | Description                           |
| ------------------- | -------- | ------------------------------------- |
| `OPENALEX_API_KEY`  | Yes      | OpenAlex API key                      |
| `OPENALEX_EMAIL`    | Yes      | Email for OpenAlex API                |
| `GOOGLE_API_KEY`    | Yes      | Gemini API key                        |
| `QDRANT_URL`        | Yes      | Qdrant server URL                     |
| `QDRANT_API_KEY`    | No       | Qdrant API key (if auth enabled)      |
| `QDRANT_COLLECTION` | No       | Collection name (default: `clusters`) |
| `OPENALEX_RPM`      | No       | OpenAlex rate limit (default: 10)     |
| `GEMINI_RPM`        | No       | Gemini rate limit (default: 10)       |

## CLI Reference

```
Usage: cli [options] [command]

CLI for map-of-science operations

Options:
  -h, --help       display help for command

Commands:
  embed [options]           Embed clusters from JSON file into vector store
  search [options] <query>  Search clusters using vector similarity
  help [command]            display help for command
```

### embed

```
Usage: cli embed [options]

Embed clusters from JSON file into vector store

Options:
  -i, --input <path>           Path to clusters JSON file
  -s, --start <number>         Start index (0-based)
  -l, --limit <number>         Number of clusters to process
  -m, --max-articles <number>  Max articles per cluster
  -h, --help                   display help for command
```

#### Generated Vectors

Each cluster produces two vectors:

- **articles** - Embedding of concatenated article titles and abstracts. Rich representation capturing specific terminology.
- **concepts** - Embedding of key concept tags. Lightweight representation of broad categories.

Both vectors are stored with names `articles` and `concepts`, which are used by the `search` command.

### search

```
Usage: cli search [options] <query>

Search clusters using vector similarity

Arguments:
  query                    Search query text

Options:
  -v, --vector <names>     Vector(s) to search (default: "articles")
  -f, --fusion <strategy>  Strategy for combining multiple vectors
  -w, --weights <ratio>    Importance ratio for weighted fusion (e.g., 3:1)
  -l, --limit <n>          Result limit (default: "10")
  -h, --help               display help for command
```

#### Vectors

Each cluster has two vectors representing different aspects:

- **articles** - Rich embedding from article content. Captures specific terminology and detailed concepts.
- **concepts** - Lightweight embedding from high-level tags (key concepts). Captures broad categories.

#### Single Vector Search

Search using one vector (default behavior):

```bash
cli search "quantum computing" --vector articles
cli search "quantum computing" --vector concepts
```

#### Multi-Vector Search

Combine both vectors for potentially better results. Requires `--fusion` to specify how results are merged:

```bash
cli search "quantum computing" --vector articles,concepts --fusion rrf
cli search "quantum computing" --vector articles,concepts --fusion score-fusion
cli search "quantum computing" --vector articles,concepts --fusion weighted --weights 3:1
```

#### Fusion Strategies

When searching multiple vectors, each returns a ranked list of results. Fusion combines these into a single ranking:

| Strategy   | Aliases        | Description                                                            |
| ---------- | -------------- | ---------------------------------------------------------------------- |
| `rrf`      | `rank-fusion`  | Combines by position in each list, ignoring similarity scores.         |
| `dbsf`     | `score-fusion` | Combines normalized similarity scores. Use when scores are meaningful. |
| `weighted` | N/A            | Custom weight per vector. Requires `--weights`.                        |

**Weights** are specified as a ratio (e.g., `3:1` means 75% articles, 25% concepts).
