// TODO: delete this module once Qdrant cluster y-coords are migrated to
// SVG-space. Currently Qdrant stores y in raw ETO convention (y-up) while the
// renderer uses SVG-space (y-down). These helpers flip y at the tRPC
// boundaries until the data migration ships.

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
