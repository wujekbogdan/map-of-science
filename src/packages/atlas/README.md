# Atlas

The core domain of Map of Science.

## What atlas is

Atlas owns the concepts that describe the map: clusters, areas, and content items. It defines what these things are, how they relate, and what operations they need.

Nothing in this package knows about HTTP, databases, or UI. It's about concepts, not plumbing.

## What's here

Follows DDD:

**Aggregates** - entities with their own identity:

- `Cluster`
- `Area`
- `ContentItem`

**Value objects** - small immutable pieces without identity:

- `EntityRef`

**Services** - operations that don't sit naturally on a single entity:

- `Search`

**Repository interfaces** - storage contracts, one per aggregate:

- `ClusterRepository`
- `AreaRepository`
- `ContentRepository`

Each piece is documented where it's defined.
