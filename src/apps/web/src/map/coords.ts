// TODO: Delete this module once MAP-66 lands. Qdrant currently stores cluster
// y in raw ETO TSV convention (y-up), while the renderer works in SVG-space
// (y-down). The old in-browser TSV loader used to negate y at parse time; the
// backend keeps it raw. These helpers flip y at the three tRPC boundaries
// (outgoing bbox, incoming cluster position, zoom target derivation) until
// the data migration ships.

type Point = { x: number; y: number };
type Range = { min: number; max: number };
type Bbox = { x: Range; y: Range };

export const flipPositionY = (position: Point) => ({
  x: position.x,
  y: -position.y,
});

export const renderBboxToQdrantBbox = (bbox: Bbox) => ({
  x: bbox.x,
  y: { min: -bbox.y.max, max: -bbox.y.min },
});
