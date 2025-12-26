---
"@map-of-science/cli": minor
---

Add CLI for cluster embedding and similarity search.

Commands:

- `embed` - Batch process clusters from JSON into vector store
- `search` - Query clusters using single or multi-vector similarity

Features:

- Environment-based configuration with .env support
- Rate-limited API calls (OpenAlex, Gemini)
- Multi-vector search with fusion strategies (RRF, DBSF, weighted)
