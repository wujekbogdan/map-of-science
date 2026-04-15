---
"@map-of-science/web": patch
"@map-of-science/parsers": patch
"@map-of-science/atlas": patch
---

bump `zod` to `^4.3.6` and migrate to v4 API:

- `z.string().url()` → `z.url()`
- `z.string().datetime()` → `z.iso.datetime()`
- `ZodSchema<T, ZodTypeDef, unknown>` → `ZodType<T, unknown>`
