---
"@map-of-science/root": patch
---

- Add the `map-of-science-api` service, which pulls the `map-of-science-api-server` image from GHCR.
- Drop the two development services. Development moves off Render.
- Stop production web from deploying on every commit to `main`. A release deploys it.
- Build only `@map-of-science/web` for the static site, in place of every package in the workspace.
