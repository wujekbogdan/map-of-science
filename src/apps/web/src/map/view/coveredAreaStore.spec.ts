import { describe, expect, it } from "vitest";
import { selectInset, useCoveredAreaStore } from "./coveredAreaStore.ts";

const withCoveredAreaStore = (test: () => void) => () => {
  useCoveredAreaStore.setState(useCoveredAreaStore.getInitialState(), true);
  try {
    test();
  } finally {
    useCoveredAreaStore.setState(useCoveredAreaStore.getInitialState(), true);
    expect.hasAssertions();
  }
};

describe("coveredAreaStore", () => {
  it(
    "should fold a registered covered area into the inset",
    withCoveredAreaStore(() => {
      useCoveredAreaStore.getState().setCoveredArea("search", { left: 460 });

      expect(selectInset(useCoveredAreaStore.getState())).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 460,
      });
    }),
  );

  it(
    "should take the deepest coverage per edge and ignore a panel that reports zeros",
    withCoveredAreaStore(() => {
      const { setCoveredArea } = useCoveredAreaStore.getState();
      setCoveredArea("search", { left: 460 });
      setCoveredArea("cluster", { left: 920, top: 60 });
      setCoveredArea("search", { left: 0 });

      expect(selectInset(useCoveredAreaStore.getState())).toEqual({
        top: 60,
        right: 0,
        bottom: 0,
        left: 920,
      });
    }),
  );
});
