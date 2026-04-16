export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

export type BoundingBox = {
  min: Point;
  max: Point;
  center: Point;
};

export const getCenteredBoundingBox = (
  point: Point,
  mapSize: Size,
): BoundingBox => {
  const halfWidth = mapSize.width / 2;
  const halfHeight = mapSize.height / 2;
  return {
    min: { x: point.x - halfWidth, y: point.y - halfHeight },
    max: { x: point.x + halfWidth, y: point.y + halfHeight },
    center: { x: point.x, y: point.y },
  };
};

export const getBoundingBox = (
  points: Point[],
  mapSize: Size,
): BoundingBox => {
  if (points.length === 1) {
    return getCenteredBoundingBox(points[0], mapSize);
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const paddingX = (maxX - minX) * 0.1;
  const paddingY = (maxY - minY) * 0.1;

  return {
    min: { x: minX - paddingX, y: minY - paddingY },
    max: { x: maxX + paddingX, y: maxY + paddingY },
    center: {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    },
  };
};

export const computeZoomToFit = (bbox: BoundingBox, mapSize: Size) => {
  const boxWidth = bbox.max.x - bbox.min.x;
  const boxHeight = bbox.max.y - bbox.min.y;
  const zoomX = mapSize.width / boxWidth;
  const zoomY = mapSize.height / boxHeight;
  const scale = Math.min(zoomX, zoomY);
  return {
    x: -bbox.center.x * scale + mapSize.width / 2,
    y: -bbox.center.y * scale + mapSize.height / 2,
    scale,
  };
};
