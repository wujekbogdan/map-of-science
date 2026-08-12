---
"@map-of-science/atlas-store": minor
---

- Make each cluster's point id from its `externalId`. The caller no longer gives an id.
- Read and write the rich ETO cluster fields.
- Map `citationRating` and `patentRating` to the stored `citationRatingPercentile` and `patentRatingPercentile`.
- Map a related cluster's `externalId` to the stored `id`.
