---
"@map-of-science/web": patch
---

- Fix zoom buttons that drifted the map off-center after a pan.
- Refactor pan and zoom interactions into a new `MapView` module that exposes view state through declarative hooks and isolates d3 behind a renderer-agnostic driver interface.
