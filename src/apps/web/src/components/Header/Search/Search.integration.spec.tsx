import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import i18next, { type i18n } from "i18next";
import { ReactNode } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { describe, expect, it } from "vitest";
import type { Router, RouterOutputs } from "@map-of-science/api";
import { TRPCProvider } from "../../../api-client/index.ts";
import { useMapStore } from "../../../map/mapStore.ts";
import { useSelectionStore } from "../../../map/selectionStore.ts";
import { Search } from "./Search.tsx";

type Match = RouterOutputs["search"]["query"][number];

const makeCluster = (overrides: Partial<Match> = {}): Match => ({
  id: "cluster-1",
  externalId: 1,
  position: { x: 10, y: 20 },
  name: "Black Holes",
  displayName: "Black Holes",
  nameSource: "llm",
  articlesCount: 100,
  growthRating: 50,
  embedding: { model: "test", source: "titles" },
  keyConcepts: [],
  score: 0.9,
  ...overrides,
});

const mockLink =
  (handler: (path: string, input: unknown) => unknown): TRPCLink<Router> =>
  () =>
  ({ op }) =>
    observable((observer) => {
      try {
        const result = handler(op.path, op.input);
        observer.next({ result: { data: result } });
        observer.complete();
      } catch (err) {
        observer.error(err as never);
      }
    });

const setupI18n = async () => {
  const instance: i18n = i18next.createInstance();
  await instance
    .use(initReactI18next)
    .init({ lng: "en", resources: { en: {} } });
  return instance;
};

type ProvidersProps = {
  i18n: i18n;
  handler: (path: string, input: unknown) => unknown;
  children: ReactNode;
};

const TestProviders = ({ i18n, handler, children }: ProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const trpcClient = createTRPCClient<Router>({
    links: [mockLink(handler)],
  });
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </TRPCProvider>
    </QueryClientProvider>
  );
};

const getSearchInput = (container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>(
    "input[role='combobox']",
  );
  if (!input) throw new Error("search input not found");
  return input;
};

const submitSearchQuery = async (input: HTMLInputElement, query: string) => {
  const user = userEvent.setup();
  await user.click(input);
  await user.type(input, query);
  // Search debounces input by 300 ms before firing the query.
  await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
};

const withStore = (test: () => Promise<void>) => async () => {
  useMapStore.getState().setMapSize({ width: 800, height: 600 });
  useSelectionStore.getState().clearSelection();
  return Promise.resolve(test()).finally(() => {
    cleanup();
    expect.hasAssertions();
  });
};

describe("Search", () => {
  it(
    "should fetch and show cluster results when the user types",
    withStore(async () => {
      const i18n = await setupI18n();
      const { container, findByText } = render(
        <TestProviders
          i18n={i18n}
          handler={() => [makeCluster({ id: "c1", name: "Black Holes" })]}
        >
          <Search />
        </TestProviders>,
      );

      await submitSearchQuery(getSearchInput(container), "black holes");

      const result = await findByText("Black Holes");
      expect(result).toBeTruthy();
    }),
  );

  it(
    "should call search.query with the typed text and the search limit",
    withStore(async () => {
      const i18n = await setupI18n();
      const calls: { path: string; input: unknown }[] = [];

      const { container } = render(
        <TestProviders
          i18n={i18n}
          handler={(path, input) => {
            calls.push({ path, input });
            return [];
          }}
        >
          <Search />
        </TestProviders>,
      );

      await submitSearchQuery(getSearchInput(container), "quantum");

      await waitFor(() => {
        expect(calls).toContainEqual({
          path: "search.query",
          input: { text: "quantum", limit: 20 },
        });
      });
    }),
  );

  it(
    "should write the picked cluster into the selection store and set a desired zoom",
    withStore(async () => {
      const i18n = await setupI18n();
      const { container, findByRole } = render(
        <TestProviders
          i18n={i18n}
          handler={() => [
            makeCluster({
              id: "c1",
              name: "Black Holes",
              position: { x: 100, y: 200 },
            }),
          ]}
        >
          <Search />
        </TestProviders>,
      );

      await submitSearchQuery(getSearchInput(container), "black holes");
      const option = await findByRole("option", { name: /Black Holes/ });
      await userEvent.setup().click(option);

      await waitFor(() => {
        expect(useSelectionStore.getState().selectedClusters.size).toBe(1);
      });
      expect(
        useSelectionStore.getState().selectedClusters.get("c1")?.position,
      ).toEqual({ x: 100, y: -200 });
      expect(useMapStore.getState().desiredZoom).not.toBeNull();
    }),
  );

  it(
    'should write all results into the selection store when "highlight all" is picked',
    withStore(async () => {
      const i18n = await setupI18n();
      const { container, findByRole } = render(
        <TestProviders
          i18n={i18n}
          handler={() => [
            makeCluster({ id: "c1", name: "First" }),
            makeCluster({
              id: "c2",
              name: "Second",
              position: { x: 50, y: 50 },
            }),
          ]}
        >
          <Search />
        </TestProviders>,
      );

      await submitSearchQuery(getSearchInput(container), "something");

      const highlightAllRow = await findByRole("option", { name: /\[2\]/ });
      await userEvent.setup().click(highlightAllRow);

      await waitFor(() => {
        expect(useSelectionStore.getState().selectedClusters.size).toBe(2);
      });
    }),
  );
});
