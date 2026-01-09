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

Each cluster produces three vectors:

- **articles** - Embedding of concatenated article titles and abstracts.
- **titles** - Embedding of article titles only (no abstracts).
- **concepts** - Embedding of key concept tags.

All vectors are used by the `search` command.

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

#### Single Vector Search

Search using one vector (default behavior):

```bash
cli search "quantum computing" --vector articles
cli search "quantum computing" --vector titles
cli search "quantum computing" --vector concepts
```

#### Multi-Vector Search

Combine 2-3 vectors. Requires `--fusion` to specify how results are merged:

```bash
cli search "quantum computing" --vector articles,concepts --fusion rrf
cli search "quantum computing" --vector articles,concepts --fusion score-fusion
cli search "quantum computing" --vector articles,concepts --fusion weighted --weights 3:1
cli search "quantum computing" --vector articles,titles,concepts --fusion weighted --weights 3:2:1
```

#### Fusion Strategies

When searching multiple vectors, each returns a ranked list of results. Fusion combines these into a single ranking:

| Strategy   | Aliases        | Description                                                            |
| ---------- | -------------- | ---------------------------------------------------------------------- |
| `rrf`      | `rank-fusion`  | Combines by position in each list, ignoring similarity scores.         |
| `dbsf`     | `score-fusion` | Combines normalized similarity scores. Use when scores are meaningful. |
| `weighted` | N/A            | Custom weight per vector. Requires `--weights`.                        |

**Weights** are specified as a ratio matching vector count (e.g., `3:1` for 2 vectors, `3:2:1` for 3 vectors).
