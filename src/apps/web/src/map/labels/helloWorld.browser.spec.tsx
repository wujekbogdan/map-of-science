import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

describe("browser mode sanity check", () => {
  it("should render a box and return real pixel dimensions from getBoundingClientRect", async () => {
    const screen = await render(
      <div
        data-testid="box"
        style={{ width: "120px", height: "80px", background: "tomato" }}
      />,
    );

    const box = screen.getByTestId("box").element();
    const rect = box.getBoundingClientRect();

    expect(rect.width).toBe(120);
    expect(rect.height).toBe(80);
  });

  it("should resolve CSS calc + var via the real style engine", async () => {
    const screen = await render(
      <div
        data-testid="scaled"
        style={
          {
            "--k": 4,
            width: "calc(40px / var(--k))",
          } as React.CSSProperties
        }
      />,
    );

    const el = screen.getByTestId("scaled").element();
    const rect = el.getBoundingClientRect();

    expect(rect.width).toBe(10);
  });
});
