---
"@map-of-science/web": patch
---

- Switch pan and zoom from declarative to imperative SVG updates; frame pacing is smoother and React no longer re-renders the map on every tick
- Stop re-rendering zoom controls on every pan tick
