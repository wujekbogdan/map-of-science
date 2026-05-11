import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SortFilter } from "./SortFilter.tsx";
import type { SortSelection } from "./sortSelection.ts";

afterEach(cleanup);

const renderSortFilter = (value: SortSelection) => {
  const onChange = vi.fn();
  const { container } = render(
    <SortFilter value={value} onChange={onChange} />,
  );
  const select = container.querySelector<HTMLSelectElement>("select");
  if (!select) throw new Error("select not found");
  return { container, select, onChange, user: userEvent.setup() };
};

describe("SortFilter", () => {
  it("should render a select with the current kind selected", () => {
    const { select } = renderSortFilter({ kind: "relevance" });
    expect(select.value).toBe("relevance");
  });

  it("should emit the kind's default value when the user switches kind", async () => {
    const { select, onChange, user } = renderSortFilter({ kind: "relevance" });
    await user.selectOptions(select, "articlesCount");
    expect(onChange).toHaveBeenCalledWith({
      kind: "articlesCount",
      direction: "desc",
    });
  });

  it("should flip direction when the user clicks the direction toggle", async () => {
    const { container, onChange, user } = renderSortFilter({
      kind: "articlesCount",
      direction: "desc",
    });
    const toggle = container.querySelector<HTMLButtonElement>("button");
    if (!toggle) throw new Error("direction toggle not found");
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith({
      kind: "articlesCount",
      direction: "asc",
    });
  });
});
