---
"@map-of-science/api-server": minor
---

- Add a `/health` liveness endpoint that returns 200 and makes no external calls.
- Add a `/ready` readiness endpoint that queries Qdrant for a single cluster. It returns 200 when the query returns a cluster.
- Add a Docker `HEALTHCHECK` that probes `/health`.
- Require `SERVER_PORT` when running the image.
- Log through pino instead of `console`.
