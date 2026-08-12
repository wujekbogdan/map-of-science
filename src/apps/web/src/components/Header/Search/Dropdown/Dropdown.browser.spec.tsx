import i18next, { type i18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import type { SelectedCluster } from "../../../../map/selectionStore.ts";
import { Dropdown, type Option } from "./Dropdown.tsx";

const setupI18n = async () => {
  const instance: i18n = i18next.createInstance();
  await instance
    .use(initReactI18next)
    .init({ lng: "en", resources: { en: {} } });
  return instance;
};

const cluster: SelectedCluster = {
  id: "c-1",
  externalId: 1,
  position: { x: 0, y: 0 },
  name: "Black Holes",
  displayName: "Black Holes",
  nameSource: "llm",
  articlesCount: 100,
  growthRating: 50,
  embedding: { model: "test", source: "titles" },
  keyConcepts: [],
  averageArticleAgeYears: 0,
  citationRating: 0,
  patentRating: 0,
  topJournals: [],
  topInstitutions: [],
  topCompanies: [],
  articles: { core: [], review: [], highlyCited: [] },
  relatedClusters: { topCiting: [], topCited: [] },
  score: 0.9,
};

const clusterOption: Option = {
  type: "cluster",
  id: cluster.id,
  label: "Black Holes",
  keyword: "Black Holes",
  cluster,
};

describe("Dropdown", () => {
  it("should reset the search when the clear button is clicked while the result list is open", async () => {
    const instance = await setupI18n();
    const onReset = vi.fn();

    await render(
      <I18nextProvider i18n={instance}>
        <Dropdown
          value="black"
          query="black"
          options={[clusterOption]}
          selectedOptionId={null}
          matchCount={1}
          isQuerySubmittable
          isFetching={false}
          onSelect={vi.fn()}
          onReset={onReset}
          onInput={vi.fn()}
          onItemHover={vi.fn()}
        />
      </I18nextProvider>,
    );

    await userEvent.click(
      page.getByRole("button", { name: "search.dropdown.reset" }),
    );

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("should keep the clear button clickable after the input is blurred and refocused", async () => {
    const instance = await setupI18n();
    const onReset = vi.fn();

    await render(
      <I18nextProvider i18n={instance}>
        <button data-testid="outside">outside</button>
        <Dropdown
          value="black"
          query="black"
          options={[clusterOption]}
          selectedOptionId={null}
          matchCount={1}
          isQuerySubmittable
          isFetching={false}
          onSelect={vi.fn()}
          onReset={onReset}
          onInput={vi.fn()}
          onItemHover={vi.fn()}
        />
      </I18nextProvider>,
    );

    const input = page.getByRole("combobox");
    const outside = page.getByTestId("outside");
    const resetButton = page.getByRole("button", {
      name: "search.dropdown.reset",
    });

    await userEvent.click(input);
    await userEvent.click(outside);
    await userEvent.click(input);
    await userEvent.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
