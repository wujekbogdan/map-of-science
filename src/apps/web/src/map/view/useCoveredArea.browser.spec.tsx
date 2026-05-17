import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { useShallow } from "zustand/react/shallow";
import { selectInset, useCoveredAreaStore } from "./coveredAreaStore.ts";
import { MapRectContext } from "./mapRectContext.ts";
import { useCoveredArea } from "./useCoveredArea.ts";

const withCoveredAreaStore = (test: () => Promise<void>) => async () => {
  useCoveredAreaStore.setState(useCoveredAreaStore.getInitialState(), true);
  try {
    await test();
  } finally {
    useCoveredAreaStore.setState(useCoveredAreaStore.getInitialState(), true);
    expect.hasAssertions();
  }
};

const Probe = () => {
  const [active, setActive] = useState(true);
  const ref = useCoveredArea<HTMLDivElement>({
    id: "search",
    edge: "left",
    active,
  });
  return (
    <>
      <button
        type="button"
        onClick={() => setActive(false)}
        style={{ position: "fixed", right: 10, bottom: 10 }}
      >
        close
      </button>
      <div
        ref={ref}
        style={{ position: "fixed", left: 0, top: 0, width: 460, height: 600 }}
      />
    </>
  );
};

const InsetReadout = () => {
  const inset = useCoveredAreaStore(useShallow(selectInset));
  return <span data-testid="left-inset">{inset.left}</span>;
};

describe("useCoveredArea", () => {
  it(
    "should write a panel's contribution while active and clear it when inactive",
    withCoveredAreaStore(async () => {
      await render(
        <MapRectContext value={{ left: 0, top: 0, right: 1024, bottom: 768 }}>
          <Probe />
          <InsetReadout />
        </MapRectContext>,
      );

      await expect
        .element(page.getByTestId("left-inset"))
        .toHaveTextContent("460");

      await userEvent.click(page.getByRole("button", { name: "close" }));

      await expect
        .element(page.getByTestId("left-inset"))
        .toHaveTextContent("0");
    }),
  );
});
