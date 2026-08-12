---
"@map-of-science/root": patch
---

- Store local Qdrant snapshots in the `qdrant_data` volume so they survive `docker compose down`.
