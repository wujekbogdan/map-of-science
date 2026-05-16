import { cleanup, render } from "@testing-library/react";
import i18next, { type i18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, describe, expect, it } from "vitest";
import { translations } from "../../../../i18n/translations.ts";
import { SubmitRow } from "./SubmitRow.tsx";

afterEach(cleanup);

const setupI18n = async (lng: "en" | "pl"): Promise<i18n> => {
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    resources: {
      en: { translation: translations.en },
      pl: { translation: translations.pl },
    },
  });
  return instance;
};

const renderRow = (instance: i18n, query: string, matchCount: number) =>
  render(
    <I18nextProvider i18n={instance}>
      <SubmitRow query={query} matchCount={matchCount} />
    </I18nextProvider>,
  );

describe("SubmitRow", () => {
  it("should render the query in bold", async () => {
    const instance = await setupI18n("en");

    const { container } = renderRow(instance, "quantum", 42);

    expect(container.querySelector("strong")?.textContent).toBe("quantum");
  });

  it.each([
    [42, "[42 clusters]"],
    [1, "[1 cluster]"],
    [0, "[0 clusters]"],
  ])(
    "should render the English bracketed count for %i as %s",
    async (count, expected) => {
      const instance = await setupI18n("en");

      const { container } = renderRow(instance, "quantum", count);

      expect(container.textContent).toContain(expected);
    },
  );

  it.each([
    [1, "[1 klaster]"],
    [3, "[3 klastry]"],
    [5, "[5 klastrów]"],
    [0, "[0 klastrów]"],
  ])(
    "should render the Polish bracketed count for %i as %s",
    async (count, expected) => {
      const instance = await setupI18n("pl");

      const { container } = renderRow(instance, "quantum", count);

      expect(container.textContent).toContain(expected);
    },
  );
});
