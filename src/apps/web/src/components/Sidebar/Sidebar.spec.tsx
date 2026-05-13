import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./Sidebar.tsx";

describe("Sidebar", () => {
  it("should render children and reflect open state via data-open", () => {
    const { rerender, getByText, getByTestId } = render(
      <Sidebar isOpen>hello</Sidebar>,
    );

    expect(getByText("hello")).toBeTruthy();
    expect(getByTestId("sidebar").getAttribute("data-open")).toBe("true");

    rerender(<Sidebar isOpen={false}>hello</Sidebar>);

    expect(getByTestId("sidebar").getAttribute("data-open")).toBe("false");
    expect(getByText("hello")).toBeTruthy();
  });
});
