import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ClusterArticles } from "./ClusterArticles.tsx";
import { createViewedCluster } from "./test-utils/createViewedCluster.ts";
import { renderTranslated } from "./test-utils/renderTranslated.tsx";

afterEach(cleanup);

describe("ClusterArticles", () => {
  it("should render nothing when the cluster has no articles at all", async () => {
    const cluster = createViewedCluster({
      articles: { core: [], review: [], highlyCited: [] },
    });

    const { container } = await renderTranslated(
      <ClusterArticles cluster={cluster} />,
    );

    expect(container.textContent).toBe("");
  });

  it("should keep the heading when at least one kind of article is present", async () => {
    const { getByText, queryByText } = await renderTranslated(
      <ClusterArticles cluster={createViewedCluster()} />,
    );

    expect(getByText("Key recent articles")).toBeTruthy();
    expect(queryByText("Review articles")).toBeNull();
  });
});
