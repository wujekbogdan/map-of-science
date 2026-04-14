import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, act } from "@testing-library/react";
import i18next, { type i18n } from "i18next";
import { ReactNode } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { useLanguageQueryInvalidator } from "./useLanguageQueryInvalidator.ts";

const Bridge = () => {
  useLanguageQueryInvalidator();
  return null;
};

const setup = async () => {
  const testI18n: i18n = i18next.createInstance();
  await testI18n
    .use(initReactI18next)
    .init({ lng: "en", resources: { en: {}, pl: {} } });

  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  );
  return { testI18n, invalidate, wrapper };
};

describe("useLanguageQueryInvalidator", () => {
  it("should invalidate all queries when the language changes", async () => {
    const { testI18n, invalidate, wrapper: Wrapper } = await setup();

    render(
      <Wrapper>
        <Bridge />
      </Wrapper>,
    );

    await act(async () => {
      await testI18n.changeLanguage("pl");
    });

    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it("should not invalidate when language stays the same", async () => {
    const { testI18n, invalidate, wrapper: Wrapper } = await setup();

    render(
      <Wrapper>
        <Bridge />
      </Wrapper>,
    );

    await act(async () => {
      await testI18n.changeLanguage("en");
    });

    expect(invalidate).not.toHaveBeenCalled();
  });
});
