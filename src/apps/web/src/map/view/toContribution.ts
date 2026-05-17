type ViewportRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export const toContribution = (args: {
  panelRect: ViewportRect;
  mapRect: ViewportRect;
  edge: "left" | "top";
}) =>
  args.edge === "left"
    ? { left: Math.max(0, args.panelRect.right - args.mapRect.left) }
    : { top: Math.max(0, args.panelRect.bottom - args.mapRect.top) };
