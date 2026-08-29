import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ViewedCluster } from "../useViewedCluster.ts";
import { RelatedClusters } from "./RelatedClusters.tsx";
import { createViewedCluster } from "./test-utils/createViewedCluster.ts";
import { renderTranslated } from "./test-utils/renderTranslated.tsx";

const navigate = vi.fn();

vi.mock("../useNavigateToCluster.ts", () => ({
  useNavigateToCluster: () => navigate,
}));

afterEach(() => {
  cleanup();
  navigate.mockReset();
});

type Link = ViewedCluster["rankedRelatedClusters"][number];

const link = (externalId: number): Link => ({
  externalId,
  displayName: `Cluster ${externalId.toString()}`,
  id: `id-${externalId.toString()}`,
});

const withLinks = (rankedRelatedClusters: Link[]) =>
  createViewedCluster({ rankedRelatedClusters });

describe("RelatedClusters", () => {
  it("should show only the five strongest links", async () => {
    const { getAllByRole } = await renderTranslated(
      <RelatedClusters cluster={withLinks([1, 2, 3, 4, 5, 6, 7].map(link))} />,
    );

    expect(getAllByRole("listitem")).toHaveLength(5);
    expect(getAllByRole("listitem").at(-1)?.textContent).toBe("Cluster 5");
  });

  it("should open a stored cluster when its row is clicked", async () => {
    const { getByRole } = await renderTranslated(
      <RelatedClusters cluster={withLinks([link(1)])} />,
    );

    await userEvent.setup().click(getByRole("button", { name: "Cluster 1" }));

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenNthCalledWith(1, "id-1");
  });

  it("should render nothing when the cluster has no citation links", async () => {
    const { container } = await renderTranslated(
      <RelatedClusters cluster={withLinks([])} />,
    );

    expect(container.textContent).toBe("");
  });

  it("should render a cluster we do not store as plain text", async () => {
    const { queryByRole, getByRole } = await renderTranslated(
      <RelatedClusters cluster={withLinks([{ ...link(1), id: null }])} />,
    );

    expect(queryByRole("button")).toBeNull();
    expect(getByRole("listitem").textContent).toBe("Cluster 1");
  });
});
