import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18next, { type i18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContextPanel } from "./ContextPanel.tsx";

afterEach(cleanup);

const setupI18n = async (): Promise<i18n> => {
  const instance = i18next.createInstance();
  await instance
    .use(initReactI18next)
    .init({ lng: "en", resources: { en: {} } });
  return instance;
};

describe("ContextPanel", () => {
  it("should render its content and a close control that emits onClose", async () => {
    const instance = await setupI18n();
    const onClose = vi.fn();

    const { getByText, getByRole } = render(
      <I18nextProvider i18n={instance}>
        <ContextPanel onClose={onClose}>panel body</ContextPanel>
      </I18nextProvider>,
    );

    expect(getByText("panel body")).toBeTruthy();

    await userEvent.setup().click(getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should render the header inside an h2", async () => {
    const instance = await setupI18n();

    const { getByRole } = render(
      <I18nextProvider i18n={instance}>
        <ContextPanel onClose={vi.fn()} header="Panel title">
          body
        </ContextPanel>
      </I18nextProvider>,
    );

    expect(getByRole("heading", { level: 2 }).textContent).toBe("Panel title");
  });

  it("should render no heading when header is omitted", async () => {
    const instance = await setupI18n();

    const { queryByRole } = render(
      <I18nextProvider i18n={instance}>
        <ContextPanel onClose={vi.fn()}>body</ContextPanel>
      </I18nextProvider>,
    );

    expect(queryByRole("heading")).toBeNull();
  });

  it("should still emit onClose when a header is present", async () => {
    const instance = await setupI18n();
    const onClose = vi.fn();

    const { getByRole } = render(
      <I18nextProvider i18n={instance}>
        <ContextPanel onClose={onClose} header="Panel title">
          body
        </ContextPanel>
      </I18nextProvider>,
    );

    await userEvent.setup().click(getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
