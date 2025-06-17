---
"@map-of-science/web": minor
---

Remove the legacy `foreground.svg` file along with the Vite SVG parser plugin, and move all the data the plugin was extracting from the SVG file into a TSV file. Now, all the label data is rendered based on that file.
