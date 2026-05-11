import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FC } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { defineFilter, type FilterComponentProps } from "./defineFilter.tsx";

afterEach(cleanup);

const SampleComponent: FC<FilterComponentProps<number>> = ({
  value,
  onChange,
}) => (
  <button type="button" onClick={() => onChange(value + 1)}>
    {value}
  </button>
);

const sampleFilter = defineFilter<number>({
  id: "sample",
  routeSchema: { sample: z.number().optional().catch(undefined) },
  parse: (params) => (typeof params.sample === "number" ? params.sample : 0),
  serialize: (value) => ({ sample: value === 0 ? undefined : value }),
  Component: SampleComponent,
});

describe("defineFilter", () => {
  it("should render the wrapped component with value parsed from params", () => {
    const onChange = vi.fn();
    render(
      <sampleFilter.Component params={{ sample: 7 }} onChange={onChange} />,
    );

    expect(screen.getByRole("button").textContent).toBe("7");
  });

  it("should forward changes from the wrapped component as serialized params", async () => {
    const onChange = vi.fn();
    render(
      <sampleFilter.Component params={{ sample: 4 }} onChange={onChange} />,
    );

    await userEvent.setup().click(screen.getByRole("button"));

    expect(onChange).toHaveBeenCalledWith({ sample: 5 });
  });
});
