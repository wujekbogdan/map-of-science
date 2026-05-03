/**
 * The view's transform. Maps World coords (data positions, independent of zoom or pan) to Screen coords (pixel offsets in the rendered viewport).
 *
 * For a world point (X, Y) the screen coords are
 *   screenX = X * scale + x
 *   screenY = Y * scale + y
 *
 * - `x` and `y` are Screen coords (pixel offsets)
 * - `scale` is dimensionless and identical on both axes.
 */
export type Transform = { x: number; y: number; scale: number };
