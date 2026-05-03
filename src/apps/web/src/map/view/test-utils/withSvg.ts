import { expect } from "vitest";

const SVG_NS = "http://www.w3.org/2000/svg";

export const withSvg =
  (test: (svg: SVGSVGElement) => void | Promise<void>) => async () => {
    const svg = document.createElementNS(SVG_NS, "svg");
    document.body.appendChild(svg);
    return Promise.resolve(test(svg)).finally(() => {
      document.body.innerHTML = "";
      expect.hasAssertions();
    });
  };
