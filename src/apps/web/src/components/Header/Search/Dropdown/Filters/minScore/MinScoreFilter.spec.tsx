import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MinScoreFilter } from "./MinScoreFilter.tsx";

afterEach(cleanup);

const renderControlled = (initial: number) => {
  const onChange = vi.fn();
  const Host = () => {
    const [value, setValue] = useState(initial);
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

  it("should emit the default value when the input is cleared", async () => {
    const { onChange, input, user } = renderControlled(0.8);
    await user.clear(input);

    expect(onChange).toHaveBeenLastCalledWith(0.65);
  });

  it("should constrain the input to the 0..1 range with a 0.01 step", () => {
    const { input } = renderControlled(0.65);
    expect(input.min).toBe("0");
    expect(input.max).toBe("1");
    expect(input.step).toBe("0.01");
  });

  it("should reset the displayed text to the current value on blur", async () => {
    const { input, user } = renderControlled(0.65);
    await user.click(input);
    await user.clear(input);
    await user.tab();

    expect(input.value).toBe("0.65");
  });

  it("should reflect external value changes when the input is not focused", async () => {
    const Host = () => {
      const [value, setValue] = useState(0.5);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setValue(0.8);
            }}
          >
            external
          </button>
          <MinScoreFilter value={value} onChange={setValue} />
        </>
      );
    };
    const { container, getByRole } = render(<Host />);
    const input = container.querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("input not found");
    const user = userEvent.setup();

    await user.click(getByRole("button", { name: "external" }));

    expect(input.value).toBe("0.8");
  });
});
