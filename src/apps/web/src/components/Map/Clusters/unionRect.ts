type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

export const unionRect = (rects: Rect[]) => {
  const top = Math.min(...rects.map((rect) => rect.top));
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return {
    top,
    left,
    right,
    bottom,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};
