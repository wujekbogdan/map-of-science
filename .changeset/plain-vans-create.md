---
"@map-of-science/web": minor
---

- Open the cluster detail in a left side panel at `/cluster/$id`, replacing the click-to-open iframe modal.
- Route map cluster clicks to `/cluster/$id`.
- Route search dropdown single-result picks to `/cluster/$id` instead of selecting it on the map.
- Redesign the header control group: include the "About the map" button and rename `Toggles` to `Controls`.
- Disable suspense in react-i18next.
- Add a purple halo ring around the active cluster.
- Adjust zoom to cluster size when centering on a cluster via URL or search.
