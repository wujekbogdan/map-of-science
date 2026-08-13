import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ClusterTopSources } from "./ClusterTopSources.tsx";
import { createViewedCluster } from "./test-utils/createViewedCluster.ts";
import { renderTranslated } from "./test-utils/renderTranslated.tsx";

afterEach(cleanup);

describe("ClusterTopSources", () => {
  it("should render each kind of source as its own labelled list", async () => {
    const { getByRole, getAllByRole } = await renderTranslated(
      <ClusterTopSources cluster={createViewedCluster()} />,
    );

    expect(
      getByRole("heading", { name: "Key journals", level: 4 }),
    ).toBeTruthy();
    expect(getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Chemical Engineering Journal",
      "Small",
      "Chinese Academy of Sciences – China",
      "Samsung (South Korea)",
    ]);
  });

  it("should drop the companies list when the cluster has no companies", async () => {
    const { queryByRole, getByRole } = await renderTranslated(
      <ClusterTopSources cluster={createViewedCluster({ topCompanies: [] })} />,
    );

    expect(queryByRole("heading", { name: "Key companies" })).toBeNull();
    expect(
      getByRole("heading", { name: "Key institutions", level: 4 }),
    ).toBeTruthy();
  });
});
