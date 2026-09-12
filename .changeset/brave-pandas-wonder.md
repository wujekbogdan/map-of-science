---
"@map-of-science/root": patch
---

- Exclude environment files and build output from the Docker build context.
- Publish the web container on port 8080, which the image now listens on.
- Drop the unused docker compose file.
