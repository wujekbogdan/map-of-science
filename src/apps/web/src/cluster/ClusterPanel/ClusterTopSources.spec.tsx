import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ClusterTopSources } from "./ClusterTopSources.tsx";
import { createViewedCluster } from "./test-utils/createViewedCluster.ts";
import { definitionFor } from "./test-utils/definitionFor.ts";
import { renderTranslated } from "./test-utils/renderTranslated.tsx";

afterEach(cleanup);

describe("ClusterTopSources", () => {
  it.each([
    ["Key journals", "Chemical Engineering Journal, Small"],
    ["Key institutions", "Chinese Academy of Sciences – China"],
    ["Key companies", "Samsung (South Korea)"],
  ])("should show %s as %s", async (label, value) => {
    const { container } = await renderTranslated(
      <ClusterTopSources cluster={createViewedCluster()} />,
    );

    expect(definitionFor(container, label)).toBe(value);
  });

  it("should drop the companies line when the cluster has no companies", async () => {
    const { container } = await renderTranslated(
      <ClusterTopSources cluster={createViewedCluster({ topCompanies: [] })} />,
    );

    expect(container.textContent).not.toContain("Key companies");
    expect(definitionFor(container, "Key journals")).toBe(
      "Chemical Engineering Journal, Small",
    );
  });
});
