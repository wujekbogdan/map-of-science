---
"@map-of-science/web": patch
---

- Ship an nginx configuration in the image, so it serves the app on any host. Client routes, cache headers and gzip no longer depend on the platform.
- Run the container as a non-root user on port 8080.
- Accept a root-relative `apiUrl` such as `/api`, next to an absolute URL.
