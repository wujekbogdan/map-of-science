import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ArticleList } from "./ArticleList.tsx";
import { renderTranslated } from "./test-utils/renderTranslated.tsx";

afterEach(cleanup);

const article = {
  title: "Strategies toward High-Loading Lithium-Sulfur Battery",
  metadata: "2020: Advanced Energy Materials",
  citations: 556,
  doi: "10.1002/aenm.201903937",
};

describe("ArticleList", () => {
  it("should link the title to its DOI", async () => {
    const { getByRole } = await renderTranslated(
      <ArticleList title="Core articles" articles={[article]} />,
    );

    expect(
      getByRole("link", { name: article.title }).getAttribute("href"),
    ).toBe("https://doi.org/10.1002/aenm.201903937");
  });

  it("should render the title as plain text when the article has no DOI", async () => {
    const { queryByRole, getByText } = await renderTranslated(
      <ArticleList
        title="Core articles"
        articles={[{ ...article, doi: null }]}
      />,
    );

    expect(queryByRole("link")).toBeNull();
    expect(getByText(article.title, { exact: false })).toBeTruthy();
  });

  it.each([
    [
      "a plain title",
      article,
      "Strategies toward High-Loading Lithium-Sulfur Battery. 2020: Advanced Energy Materials. 556 citations.",
    ],
    [
      "a title that closes itself",
      { ...article, title: "Roles and Routes:" },
      "Roles and Routes: 2020: Advanced Energy Materials. 556 citations.",
    ],
    [
      "an article ETO gives no journal for",
      { ...article, metadata: "2020" },
      "Strategies toward High-Loading Lithium-Sulfur Battery. 2020. 556 citations.",
    ],
    [
      "an article cited once",
      { ...article, citations: 1 },
      "Strategies toward High-Loading Lithium-Sulfur Battery. 2020: Advanced Energy Materials. 1 citation.",
    ],
  ])("should read correctly for %s", async (_case, given, expected) => {
    const { getByRole } = await renderTranslated(
      <ArticleList title="Core articles" articles={[given]} />,
    );

    expect(getByRole("listitem").textContent).toBe(expected);
  });

  it("should render nothing when the cluster has no articles of this kind", async () => {
    const { container } = await renderTranslated(
      <ArticleList title="Review articles" articles={[]} />,
    );

    expect(container.textContent).toBe("");
  });
});
