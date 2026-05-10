import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SubmitRow } from "./SubmitRow.tsx";

afterEach(cleanup);

describe("SubmitRow", () => {
  it("should render the query in bold and the bracketed match count", () => {
    const { container } = render(<SubmitRow query="quantum" matchCount={3} />);

    const strong = container.querySelector("strong");
    expect(strong?.textContent).toBe("quantum");
    expect(container.textContent).toContain("[3]");
  });

  it("should omit the bracketed match count when none match", () => {
    const { container } = render(
      <SubmitRow query="quantum" matchCount={undefined} />,
    );

    expect(container.textContent).not.toContain("[");
  });
});
