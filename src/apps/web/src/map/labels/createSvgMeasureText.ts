import { REF_FONT_SIZE } from "./config.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

// Mounts a hidden SVG once and reuses a single <text> node.
// getComputedTextLength gives the same advance widths the visible <text>
// elements use, so measurements match rendered widths exactly.
export const createSvgMeasureText = () => {
  const svg = document.createElementNS(SVG_NS, "svg");
  // sr-only: takes the node out of the visual flow and the layout, but keeps
  // it laid out by the SVG renderer so getComputedTextLength stays accurate.
  svg.setAttribute(
    "style",
    [
      "position:absolute",
      "width:1px",
      "height:1px",
      "padding:0",
      "margin:-1px",
      "overflow:hidden",
      "clip:rect(0,0,0,0)",
      "white-space:nowrap",
      "border:0",
      "pointer-events:none",
    ].join(";"),
  );
  svg.setAttribute("aria-hidden", "true");

  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("font-size", REF_FONT_SIZE.toString());
  text.setAttribute("font-weight", "bold");
  svg.appendChild(text);

  document.body.appendChild(svg);

  return (input: string) => {
    text.textContent = input;
    return text.getComputedTextLength();
  };
};
