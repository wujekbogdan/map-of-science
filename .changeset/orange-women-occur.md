---
"@map-of-science/api": patch
---

- Widen `HttpRequest.headers` to `Record<string, string | string[] | undefined>` so it accepts Node's `IncomingHttpHeaders`
- Coerce array values in the `x-lang` request header read by `createContext` (first element wins)
