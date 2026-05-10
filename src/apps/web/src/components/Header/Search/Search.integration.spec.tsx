import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import i18next, { type i18n } from "i18next";
import { ReactNode } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import type { Router, RouterOutputs } from "@map-of-science/api";
import { TRPCProvider } from "../../../api-client/index.ts";
import { useSelectionStore } from "../../../map/selectionStore.ts";
import { MapView, type MapViewConfig } from "../../../map/view/MapView.tsx";
import { createFakeDebouncer } from "../../../map/view/test-utils/createFakeDebouncer.ts";
import {
  createFakeDriver,
  type FakeDriver,
} from "../../../map/view/test-utils/createFakeDriver.ts";
import { Search } from "./Search.tsx";
import { searchParamsSchema } from "./searchParams.ts";

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

const baseConfig = (): {
  fake: FakeDriver;
  config: MapViewConfig<SVGSVGElement>;
} => {
  const fake = createFakeDriver();
  const debouncer = createFakeDebouncer();
  return {
    fake,
    config: {
      scaleExtent: { min: 0.5, max: 100 },
      debounceMs: 0,
      initial: { x: 0, y: 0, scale: 1 },
      defaults: { animate: true, padding: 0.1 },
      createDriver: fake.create,
      createDebouncer: debouncer.create,
    },
  };
};

type TestRouterDeps = {
  i18n: i18n;
  config: MapViewConfig<SVGSVGElement>;
  children: ReactNode;
  initialUrl?: string;
};

const buildTestRouter = ({
  i18n,
  config,
  children,
  initialUrl = "/",
}: TestRouterDeps) => {
  const testRoot = createRootRoute({
    validateSearch: searchParamsSchema,
    component: () => (
      <I18nextProvider i18n={i18n}>
        <MapView
          config={config}
          size={{ width: 800, height: 600 }}
          chrome={children}
        />
      </I18nextProvider>
    ),
  });
  return createRouter({
    routeTree: testRoot,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
  });
};

type ProvidersProps = {
  handler: (path: string, input: unknown) => unknown;
  router: ReturnType<typeof buildTestRouter>;
};

const TestProviders = ({ handler, router }: ProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const trpcClient = createTRPCClient<Router>({
    links: [mockLink(handler)],
  });
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <RouterProvider router={router} />
      </TRPCProvider>
    </QueryClientProvider>
  );
};

const findSearchInput = (container: HTMLElement) =>
  waitFor(() => {
    const input = container.querySelector<HTMLInputElement>(
      "input[role='combobox']",
    );
    if (!input) throw new Error("search input not found");
    return input;
  });

const submitSearchQuery = async (
  container: HTMLElement,
  query: string,
): Promise<void> => {
  const input = await findSearchInput(container);
  const user = userEvent.setup();
  await user.click(input);
  await user.type(input, query);
  // Search debounces input by 300 ms before firing the query.
  await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
};

const withStore = (test: () => Promise<void>) => async () => {
  useSelectionStore.getState().clearSelection();
  return Promise.resolve(test()).finally(() => {
    cleanup();
    expect.hasAssertions();
  });
};

describe("Search", () => {
  it(
    "should fire search.query with q and minScore from the URL on mount",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const handler = vi.fn().mockReturnValue([]);
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
        initialUrl: '/?q="quantum"&minScore=0.8',
      });

      render(<TestProviders handler={handler} router={router} />);

      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith("search.query", {
          text: "quantum",
          limit: 500,
          minScore: 0.8,
          sort: { kind: "relevance" },
        });
      });
    }),
  );

  it(
    "should populate the search input with q from the URL on mount",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const handler = vi.fn().mockReturnValue([]);
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
        initialUrl: '/?q="quantum"',
      });

      const { container } = render(
        <TestProviders handler={handler} router={router} />,
      );

      const input = await findSearchInput(container);
      expect(input.value).toBe("quantum");
    }),
  );

  it(
    "should fetch and show cluster results when the user types",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });
      const { container, findByText } = render(
        <TestProviders
          handler={() => [makeCluster({ id: "c1", name: "Black Holes" })]}
          router={router}
        />,
      );

      await submitSearchQuery(container, "black holes");

      const result = await findByText("Black Holes");
      expect(result).toBeTruthy();
    }),
  );

  it(
    "should call search.query with the typed text and the search limit",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const handler = vi.fn().mockReturnValue([]);
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });

      const { container } = render(
        <TestProviders handler={handler} router={router} />,
      );

      await submitSearchQuery(container, "quantum");

      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith("search.query", {
          text: "quantum",
          limit: 500,
          minScore: 0.65,
          sort: { kind: "relevance" },
        });
      });
    }),
  );

  it(
    "should push the typed query into the URL when the user presses Enter",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const handler = vi.fn().mockReturnValue([]);
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });

      const { container } = render(
        <TestProviders handler={handler} router={router} />,
      );

      const input = await findSearchInput(container);
      const user = userEvent.setup();
      await user.click(input);
      await user.type(input, "quantum");
      await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(router.state.location.search.q).toBe("quantum");
      });
    }),
  );

  it(
    "should select and focus the picked cluster on the map and leave the URL unchanged",
    withStore(async () => {
      const i18n = await setupI18n();
      const { fake, config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });

      const { container, findByRole } = render(
        <TestProviders
          handler={() => [
            makeCluster({
              id: "c1",
              name: "Black Holes",
              position: { x: 100, y: 200 },
            }),
          ]}
          router={router}
        />,
      );

      await submitSearchQuery(container, "black holes");
      const option = await findByRole("option", { name: /Black Holes/ });
      await userEvent.setup().click(option);

      await waitFor(() => {
        expect(useSelectionStore.getState().selectedClusters.size).toBe(1);
      });
      expect(
        useSelectionStore.getState().selectedClusters.get("c1")?.position,
      ).toEqual({ x: 100, y: 200 });
      // fitToPoints([{x:100,y:200}]) at size 800x600 → centered at scale 1:
      // x = -100 + 400 = 300; y = -200 + 300 = 100
      expect(fake.applyTransform).toHaveBeenCalledWith(
        { x: 300, y: 100, scale: 1 },
        { animate: true },
      );
      expect(router.state.location.search.q).toBeUndefined();
    }),
  );

  it(
    'should commit the search, select all matches, and zoom to them on "highlight all"',
    withStore(async () => {
      const i18n = await setupI18n();
      const { fake, config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });
      const { container, findByRole } = render(
        <TestProviders
          handler={() => [
            makeCluster({ id: "c1", name: "First" }),
            makeCluster({
              id: "c2",
              name: "Second",
              position: { x: 50, y: 50 },
            }),
          ]}
          router={router}
        />,
      );

      await submitSearchQuery(container, "something");

      const highlightAllRow = await findByRole("option", {
        name: /something/i,
      });
      await userEvent.setup().click(highlightAllRow);

      await waitFor(() => {
        expect(useSelectionStore.getState().selectedClusters.size).toBe(2);
      });
      await waitFor(() => {
        expect(router.state.location.search.q).toBe("something");
      });
      await waitFor(() => {
        expect(fake.applyTransform).toHaveBeenCalled();
      });
    }),
  );

  it(
    "should commit and zoom to all matches when the user submits before results have loaded",
    withStore(async () => {
      const i18n = await setupI18n();
      const { fake, config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });
      const handler = vi.fn().mockReturnValue([
        makeCluster({
          id: "c1",
          name: "First",
          position: { x: 100, y: 200 },
        }),
        makeCluster({
          id: "c2",
          name: "Second",
          position: { x: 200, y: 100 },
        }),
      ]);

      const { container } = render(
        <TestProviders handler={handler} router={router} />,
      );

      const input = await findSearchInput(container);
      const user = userEvent.setup();
      await user.click(input);
      await user.type(input, "quantum");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(router.state.location.search.q).toBe("quantum");
      });
      await waitFor(() => {
        expect(fake.applyTransform).toHaveBeenCalled();
      });
    }),
  );

  it(
    "should clear the URL query when the user clicks reset after submitting",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });
      const handler = vi
        .fn()
        .mockReturnValue([makeCluster({ id: "c1", name: "First" })]);

      const { container, findByRole } = render(
        <TestProviders handler={handler} router={router} />,
      );

      await submitSearchQuery(container, "quantum");
      const submitRow = await findByRole("option", { name: /quantum/ });
      const user = userEvent.setup();
      await user.click(submitRow);

      await waitFor(() => {
        expect(router.state.location.search.q).toBe("quantum");
      });

      const resetButton = await findByRole("button", {
        name: "search.dropdown.reset",
      });
      await user.click(resetButton);

      await waitFor(() => {
        expect(router.state.location.search.q).toBeUndefined();
      });
    }),
  );

  it(
    "should refire search.query at the new minScore when the filter input is edited",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const handler = vi.fn().mockReturnValue([]);
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
        initialUrl: '/?q="quantum"',
      });

      const { container } = render(
        <TestProviders handler={handler} router={router} />,
      );

      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith("search.query", {
          text: "quantum",
          limit: 500,
          minScore: 0.65,
          sort: { kind: "relevance" },
        });
      });

      // Filters render only when the dropdown is open.
      const searchInput = await findSearchInput(container);
      const user = userEvent.setup();
      await user.click(searchInput);

      const minScoreInput = await waitFor(() => {
        const input = document.querySelector<HTMLInputElement>(
          "input[type='number']",
        );
        if (!input) throw new Error("min-score input not found");
        return input;
      });

      await user.clear(minScoreInput);
      await user.type(minScoreInput, "0.9");

      await waitFor(() => {
        expect(router.state.location.search.minScore).toBe(0.9);
      });
      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith("search.query", {
          text: "quantum",
          limit: 500,
          minScore: 0.9,
          sort: { kind: "relevance" },
        });
      });
    }),
  );
});
