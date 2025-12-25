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

### search

```
Usage: cli search [options] <query>

Search clusters using vector similarity

Arguments:
  query                Search query text

Options:
  -v, --vector <name>  Vector to search (choices: "articles", "concepts", default: "articles")
  -l, --limit <n>      Result limit (default: "10")
  -h, --help           display help for command
```
