---
"@map-of-science/api": patch
---

- Read request language from the `x-lang` header (`en_US` or `pl_PL`); fall back to `en_US` on missing or unsupported value instead of throwing.
