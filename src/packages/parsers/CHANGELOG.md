# @map-of-science/parsers

## 0.2.3

### Patch Changes

- 5b8bea3: - Bump `typescript` to `~6.0.3`.
  - Bump `@types/node` to `^22.19.17`.

## 0.2.2

### Patch Changes

- 4c34142: - Bump `eslint` to `^9.39.4`.
- 4c34142: - Bump `vitest` to `^4.1.5`.

## 0.2.1

### Patch Changes

- 88fe63f: bump `zod` to `^4.3.6` and migrate to v4 API:

  - `z.string().url()` → `z.url()`
  - `z.string().datetime()` → `z.iso.datetime()`
  - `ZodSchema<T, ZodTypeDef, unknown>` → `ZodType<T, unknown>`

## 0.2.0

### Minor Changes

- fff35db: Add JSON and NDJSON streaming parsers for memory-efficient large file processing.

  - `streamJson()` / `streamJsonFile()` - JSON streaming from readable stream
  - `streamNdjson()` / `streamNdjsonFile()` - NDJSON line-delimited streaming

- fff35db: Rename package from `@map-of-science/csv` to `@map-of-science/parsers`.

  Supports multiple data formats with dual entry points:

  - `./browser` - CSV parsing only (browser-compatible)
  - `./node` - CSV + JSON + NDJSON streaming (Node.js)

- fff35db: Add NDJSON streaming parser

### Patch Changes

- 7f733cb: - Export TS source directly (remove build step).
  - Split test into `test:unit`/`test:integration`.
  - Add `vitest.config.ts` with unit+integration projects.
  - Upgrade vitest to `^4.0.15`.
- fff35db: Move the `withRequestInterception` unit testing helper to a newly created `@map-of-science/test-utils` package.

## 0.1.0

### Minor Changes

- 9d8e6ba: Extract the CSV parser and related utilities into a separate `@map-of-science/csv` package.

### Patch Changes

- 8ae6d4d: Install `vitest` directly instead of relying on the binary exposed by the `@map-of-science/vites` package.
