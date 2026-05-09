---
"@map-of-science/api-server": patch
"@map-of-science/web": patch
---

- Update Dockerfile `PATH` to include `$PNPM_HOME/bin`, where pnpm v11 writes its global binaries.
