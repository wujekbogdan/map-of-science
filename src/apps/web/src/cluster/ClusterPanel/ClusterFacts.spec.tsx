import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ClusterFacts } from "./ClusterFacts.tsx";
import { createViewedCluster } from "./test-utils/createViewedCluster.ts";
import { definitionFor } from "./test-utils/definitionFor.ts";
import { renderTranslated } from "./test-utils/renderTranslated.tsx";

afterEach(cleanup);

const cluster = createViewedCluster();

describe("ClusterFacts", () => {
  it("should render the keywords as one comma separated line", async () => {
    const { getByText } = await renderTranslated(
      <ClusterFacts cluster={cluster} />,
    );

    expect(getByText("sulfur batteries, high sulfur loading")).toBeTruthy();
  });

  it.each([
    ["Cluster size", "6701 recent articles"],
    ["Average article age", "5.8 years"],
    ["Growth rate", "65.60"],
    ["Citation rating", "75.47"],
    ["Patent rating", "99.78"],
  ])("should show %s as %s", async (label, value) => {
    const { container } = await renderTranslated(
      <ClusterFacts cluster={cluster} />,
    );

    expect(definitionFor(container, label)).toBe(value);
  });

  it("should write decimals with the separator of the active language", async () => {
    const { container } = await renderTranslated(
      <ClusterFacts cluster={cluster} />,
      "pl",
    );

    expect(container.textContent).toContain("65,60");
    expect(container.textContent).toContain("5,8");
  });
});
