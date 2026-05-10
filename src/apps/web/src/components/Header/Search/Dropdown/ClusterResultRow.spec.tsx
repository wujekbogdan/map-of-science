import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ClusterResultRow } from "./ClusterResultRow.tsx";

afterEach(cleanup);

describe("ClusterResultRow", () => {
  it("should render the cluster name, articles count, formatted score, and a sized dot", () => {
    const { container } = render(
      <ClusterResultRow
        tokens={[
          { text: "Black ", type: "regular" },
          { text: "Holes", type: "bold" },
        ]}
        articlesCount={1234}
        score={0.823}
        dotRadiusPx={6}
      />,
    );

    expect(container.textContent).toContain("Black Holes");
    expect(container.textContent).toContain("1234");
    expect(container.textContent).toContain("0.82");

    const circle = container.querySelector("circle");
    expect(circle?.getAttribute("r")).toBe("6");
  });
});
