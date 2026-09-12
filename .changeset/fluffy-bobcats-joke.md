---
"@map-of-science/root": patch
---

- Publish the `map-of-science-web` and `map-of-science-api-server` images to GHCR on every commit to `main` that passes the checks, tagged `sha-<short>` and `latest`.
- Add the `stable` tag to the images that a release publishes.
- Take image tags from `docker/metadata-action` in place of hardcoded tag flags.
- Upgrade to `@changesets/cli` 3 and `changesets/action` v2.
