---
"@map-of-science/web": minor
---

- Show a cluster's own data in the cluster panel, in five parts: its facts, its articles, its top sources, its related clusters and the rating scale. The panel showed an ETO page in an iframe before.
- Link an article title to `doi.org` when the article carries a DOI, and show the title as plain text when it does not.
- Open a related cluster from its row. A row shows plain text when we do not hold that cluster.
- Leave out a part the cluster holds no data for, rather than show a heading with nothing below it.
- Title the panel with the cluster name and its ETO id.
- Scroll the panel body when the content is taller than the panel.
- Add `rhythm` in `typography.ts`, which holds the baseline grid and the type scale that the cluster panel and the context panel both follow.
- Add Polish for every new label in the panel.
