---
"@map-of-science/cli": patch
---

- Build the search service from `store.clusterAttributes` instead of `store.clusters`, which no longer holds `findByVector`. The `search` and `ingest` commands behave as before.
