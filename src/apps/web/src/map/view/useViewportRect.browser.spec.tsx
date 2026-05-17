import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { useViewportRect, type ViewportRect } from "./useViewportRect.ts";

const RectProbe = ({ style }: { style: React.CSSProperties }) => {
  const [ref, rect] = useViewportRect<HTMLDivElement>();
  return (
    <div ref={ref} style={style}>
      <span data-testid="rect">{rect ? formatRect(rect) : "null"}</span>
    </div>
  );
};

const ResizableProbe = () => {
  const [width, setWidth] = useState(200);
  const [ref, rect] = useViewportRect<HTMLDivElement>();
  return (
    <>
      <button
        type="button"
        onClick={() => setWidth(300)}
        style={{ position: "fixed", right: 10, bottom: 10 }}
      >
        widen
      </button>
      <div
        ref={ref}
        style={{ position: "fixed", left: 20, top: 10, width, height: 100 }}
      >
        <span data-testid="rect">{rect ? formatRect(rect) : "null"}</span>
      </div>
    </>
  );
};

const formatRect = (rect: ViewportRect) =>
  `${rect.left}|${rect.top}|${rect.right}|${rect.bottom}`;

describe("useViewportRect", () => {
  it("should report the element's viewport rect once attached", async () => {
    await render(
      <RectProbe
        style={{
          position: "fixed",
          left: 20,
          top: 10,
          width: 200,
          height: 100,
        }}
      />,
    );

    await expect
      .element(page.getByTestId("rect"))
      .toHaveTextContent("20|10|220|110");
  });

  it("should update the reported rect when the element resizes", async () => {
    await render(<ResizableProbe />);

    await expect
      .element(page.getByTestId("rect"))
      .toHaveTextContent("20|10|220|110");

    await userEvent.click(page.getByRole("button", { name: "widen" }));

    await expect
      .element(page.getByTestId("rect"))
      .toHaveTextContent("20|10|320|110");
  });
});
