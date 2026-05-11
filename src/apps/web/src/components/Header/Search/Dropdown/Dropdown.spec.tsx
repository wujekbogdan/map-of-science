import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18next, { type i18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import type { SelectedCluster } from "../../../../map/selectionStore.ts";
import { Dropdown, type Option } from "./Dropdown.tsx";

const setupI18n = async () => {
  const instance: i18n = i18next.createInstance();
  await instance
    .use(initReactI18next)
    .init({ lng: "en", resources: { en: {} } });
  return instance;
};

const withDropdown = (test: (i18n: i18n) => Promise<void>) => async () => {
  const instance = await setupI18n();
  return Promise.resolve(test(instance)).finally(() => {
    cleanup();
    expect.hasAssertions();
  });
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
  score: 0.9,
};

const clusterOption: Option = {
  type: "cluster",
  id: cluster.id,
  label: "Black Holes",
  keyword: "Black Holes",
  cluster,
};

const renderDropdown = (
  instance: i18n,
  props: {
    value: string;
    query: string;
    onItemHover?: (id: string | null) => void;
  },
) =>
  render(
    <I18nextProvider i18n={instance}>
      <Dropdown
        value={props.value}
        query={props.query}
        options={[clusterOption]}
        isQuerySubmittable
        isFetching={false}
        onSelect={vi.fn()}
        onReset={vi.fn()}
        onInput={vi.fn()}
        onItemHover={props.onItemHover ?? vi.fn()}
      />
    </I18nextProvider>,
  );

describe("Dropdown", () => {
  it(
    "should highlight the query prop in option labels, not the live input value",
    withDropdown(async (instance) => {
      const { container } = renderDropdown(instance, {
        value: "Black more",
        query: "Black",
      });

      const input = container.querySelector("input");
      if (!input) throw new Error("input not found");
      await userEvent.setup().click(input);

      const boldText = Array.from(
        document.body.querySelectorAll('[data-test-token="bold"]'),
      )
        .map((node) => node.textContent)
        .join("");
      expect(boldText).toBe("Black");
    }),
  );

  it(
    "should report null when unmounted while a cluster is focused",
    withDropdown(async (instance) => {
      const onItemHover = vi.fn();
      const { container, unmount } = renderDropdown(instance, {
        value: "Black",
        query: "Black",
        onItemHover,
      });

      const input = container.querySelector("input");
      if (!input) throw new Error("input not found");
      const user = userEvent.setup();
      await user.click(input);
      await user.keyboard("{ArrowDown}{ArrowDown}");

      onItemHover.mockClear();
      unmount();

      expect(onItemHover).toHaveBeenLastCalledWith(null);
    }),
  );

  it(
    "should report the cluster id of the focused option",
    withDropdown(async (instance) => {
      const onItemHover = vi.fn();
      const { container } = renderDropdown(instance, {
        value: "Black",
        query: "Black",
        onItemHover,
      });

      const input = container.querySelector("input");
      if (!input) throw new Error("input not found");
      const user = userEvent.setup();
      await user.click(input);
      // Skip the leading submit option and land on the cluster row.
      await user.keyboard("{ArrowDown}{ArrowDown}");

      expect(onItemHover).toHaveBeenCalledWith(cluster.id);
    }),
  );
});
