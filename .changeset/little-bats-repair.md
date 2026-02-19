---
"@map-of-science/cli": minor
---

Add CLI for cluster embedding, search, naming, and ETO PDF scraping.

Commands:

- `embed` - Embed cluster titles from NDJSON into Qdrant vector store
- `search` - Query clusters using single or multi-vector similarity with fusion
- `name` - Generate cluster names via LLM
- `scrape-eto` - Extract article titles from ETO cluster PDFs to NDJSON

Features:

- Environment-based configuration with .env support
- Rate-limited Gemini API calls
- NDJSON streaming input/output
