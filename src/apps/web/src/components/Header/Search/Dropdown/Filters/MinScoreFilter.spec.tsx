import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MinScoreFilter } from "./MinScoreFilter.tsx";

afterEach(cleanup);

const renderControlled = (initial: number | undefined) => {
  const onChange = vi.fn();
  const Host = () => {
    const [value, setValue] = useState<number | undefined>(initial);
    return (
      <MinScoreFilter
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    );
  };
  const { container } = render(<Host />);
  const input = container.querySelector<HTMLInputElement>("input");
  if (!input) throw new Error("input not found");
  return { onChange, input, user: userEvent.setup() };
};

describe("MinScoreFilter", () => {
  it("should display the current value in the input", () => {
    const { input } = renderControlled(0.82);
    expect(input.value).toBe("0.82");
  });

  it("should emit the parsed number when the user types a new value", async () => {
    const { onChange, input, user } = renderControlled(0.65);
    await user.clear(input);
    await user.type(input, "0.9");

    expect(onChange).toHaveBeenLastCalledWith(0.9);
  });

  it("should emit undefined when the input is cleared", async () => {
    const { onChange, input, user } = renderControlled(0.65);
    await user.clear(input);

    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});
