---
"@map-of-science/api-server": patch
---

- Build the search service from `store.clusterAttributes` instead of `store.clusters`, which no longer holds `findByVector`.
