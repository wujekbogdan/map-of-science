import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
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
import { CLUSTER_ROUTE_PATH } from "../../../cluster/routePath.ts";
import { useSelectionStore } from "../../../map/selectionStore.ts";
import { MapView, type MapViewConfig } from "../../../map/view/MapView.tsx";
import { createFakeDebouncer } from "../../../map/view/test-utils/createFakeDebouncer.ts";
import {
  createFakeDriver,
  type FakeDriver,
} from "../../../map/view/test-utils/createFakeDriver.ts";
import { ContextPanelOutlet } from "../../ContextPanel/ContextPanelOutlet.tsx";
import { Search } from "./Search.tsx";
import { searchParamsSchema } from "./searchParams.ts";
import { useSearchStore } from "./searchStore.ts";

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
        Promise.resolve(handler(op.path, op.input)).then(
          (data) => {
            observer.next({ result: { data } });
            observer.complete();
          },
          (err) => observer.error(err as never),
        );
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
  const indexRoute = createRoute({
    getParentRoute: () => testRoot,
    path: "/",
    component: () => null,
  });
  const clusterRoute = createRoute({
    getParentRoute: () => testRoot,
    path: CLUSTER_ROUTE_PATH,
    component: () => null,
  });
  return createRouter({
    routeTree: testRoot.addChildren([indexRoute, clusterRoute]),
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
  useSearchStore.setState({ draftQuery: "", previewedClusterId: null });
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
    "should open the cluster while keeping the typed query and matches so the user can keep browsing",
    withStore(async () => {
      const i18n = await setupI18n();
      const { fake, config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });
      const cluster = makeCluster({
        id: "c1",
        name: "Black Holes",
        displayName: "Black Holes",
        position: { x: 100, y: 200 },
      });
      const handler = (path: string) =>
        path === "cluster.byId" ? cluster : [cluster];

      const { container, findByRole } = render(
        <TestProviders handler={handler} router={router} />,
      );

      await submitSearchQuery(container, "black holes");
      const option = await findByRole("option", { name: /Black Holes/ });
      await userEvent.setup().click(option);

      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/cluster/c1");
      });

      // The input keeps the typed query (it is no longer overwritten by
      // the viewed cluster), and the matches stay browsable.
      const input = await findSearchInput(container);
      expect(input.value).toBe("black holes");
      expect(await findByRole("option", { name: /Black Holes/ })).toBeTruthy();
      // Opening one cluster is not a commit: nothing is selected or zoomed.
      expect(useSelectionStore.getState().selectedClusters.size).toBe(0);
      expect(fake.applyTransform).not.toHaveBeenCalled();
    }),
  );

  it(
    'should commit the search, select all matches, zoom to them on "highlight all", and re-fit on a repeat submit',
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

      const user = userEvent.setup();
      const highlightAllRow = await findByRole("option", {
        name: /something/i,
      });
      await user.click(highlightAllRow);

      await waitFor(() => {
        expect(useSelectionStore.getState().selectedClusters.size).toBe(2);
      });
      await waitFor(() => {
        expect(router.state.location.search.q).toBe("something");
      });
      await waitFor(() => {
        expect(fake.applyTransform).toHaveBeenCalled();
      });

      // Re-submitting the same query has to re-fit the map even though the
      // URL `?q=` has not changed.
      vi.mocked(fake.applyTransform).mockClear();
      const repeatSubmit = await findByRole("option", { name: /something/i });
      await user.click(repeatSubmit);

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
    "should resume keyboard navigation from the active result after selecting one",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });
      const clusters = [
        makeCluster({ id: "c1", name: "First", displayName: "First" }),
        makeCluster({
          id: "c2",
          name: "Second",
          displayName: "Second",
          position: { x: 50, y: 50 },
        }),
      ];
      const handler = (path: string) =>
        path === "cluster.byId" ? clusters[0] : clusters;

      const { container, findByRole } = render(
        <TestProviders handler={handler} router={router} />,
      );

      await submitSearchQuery(container, "something");
      const input = await findSearchInput(container);
      const firstOption = await findByRole("option", { name: /First/ });
      const secondOption = await findByRole("option", { name: /Second/ });

      const user = userEvent.setup();
      // First arrow press lands on the "First" result.
      await user.keyboard("{ArrowDown}");
      expect(input.getAttribute("aria-activedescendant")).toBe(firstOption.id);

      // Selecting the active result opens it but keeps the results browsable.
      await user.keyboard("{Enter}");
      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/cluster/c1");
      });

      // The selected row stays active with no extra keypress, ...
      expect(input.getAttribute("aria-activedescendant")).toBe(firstOption.id);

      // ... and a single arrow press advances from it to the next row.
      await user.keyboard("{ArrowDown}");
      await waitFor(() => {
        expect(input.getAttribute("aria-activedescendant")).toBe(
          secondOption.id,
        );
      });
    }),
  );

  it(
    "should clear the search and refocus the input on reset and on Escape - after typing and after a commit - keeping the viewed cluster open",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
        initialUrl: '/cluster/c1?q="quantum"',
      });
      const cluster = makeCluster({
        id: "c1",
        name: "Black Holes",
        displayName: "Black Holes",
      });
      const handler = (path: string) =>
        path === "cluster.byId" ? cluster : [cluster];

      const { container, findByRole, queryByRole } = render(
        <TestProviders handler={handler} router={router} />,
      );

      const input = await findSearchInput(container);
      const user = userEvent.setup();

      // The deep-linked query shows in the input and opens the results.
      expect(input.value).toBe("quantum");
      await findByRole("option", { name: /Black Holes/ });

      // (a) The X button clears the query and closes the results while the
      // viewed cluster stays open (results close because the query is empty).
      const resetButton = await findByRole("button", {
        name: "search.dropdown.reset",
      });
      await user.click(resetButton);

      await waitFor(() => {
        expect(router.state.location.search.q).toBeUndefined();
      });
      expect(router.state.location.pathname).toBe("/cluster/c1");
      expect(input.value).toBe("");
      expect(document.activeElement).toBe(input);
      await waitFor(() => {
        expect(queryByRole("option", { name: /Black Holes/ })).toBeNull();
      });

      // (b) Escape after typing without committing clears the same way.
      await user.click(input);
      await user.type(input, "neutron");
      await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
      await findByRole("option", { name: /Black Holes/ });

      await user.keyboard("{Escape}");

      expect(router.state.location.pathname).toBe("/cluster/c1");
      expect(input.value).toBe("");
      expect(document.activeElement).toBe(input);
      await waitFor(() => {
        expect(queryByRole("option", { name: /Black Holes/ })).toBeNull();
      });

      // (c) Escape after a commit drops ?q=, empties the input, and closes
      // the results together - the URL and the visible input must not
      // disagree - and still leaves the viewed cluster open. The commit moves
      // focus off the input, so Escape must not depend on input focus.
      await user.click(input);
      await user.type(input, "black");
      await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
      await findByRole("option", { name: /Black Holes/ });
      await user.keyboard("{Enter}");
      await waitFor(() => {
        expect(router.state.location.search.q).toBe("black");
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(router.state.location.search.q).toBeUndefined();
      });
      expect(input.value).toBe("");
      expect(router.state.location.pathname).toBe("/cluster/c1");
      expect(document.activeElement).toBe(input);
      await waitFor(() => {
        expect(queryByRole("option", { name: /Black Holes/ })).toBeNull();
      });
    }),
  );

  it(
    "should keep the viewed cluster open and the query intact when a filter changes",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
        initialUrl: '/cluster/c1?q="quantum"',
      });
      const cluster = makeCluster({
        id: "c1",
        name: "Black Holes",
        displayName: "Black Holes",
      });
      const handler = (path: string) =>
        path === "cluster.byId" ? cluster : [cluster];

      const { container, findByLabelText } = render(
        <TestProviders handler={handler} router={router} />,
      );

      const input = await findSearchInput(container);
      expect(input.value).toBe("quantum");

      const sortSelect = await findByLabelText("search.filters.sort");
      await userEvent.setup().selectOptions(sortSelect, "articlesCount");

      await waitFor(() => {
        expect(router.state.location.search.sort).toBeDefined();
      });
      expect(router.state.location.pathname).toBe("/cluster/c1");
      expect(router.state.location.search.q).toBe("quantum");
    }),
  );

  it(
    "should omit the match count on the submit row until results have arrived",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });

      let resolveResults!: (value: Match[]) => void;
      const pending = new Promise<Match[]>((resolve) => {
        resolveResults = resolve;
      });
      const handler = vi.fn().mockReturnValueOnce(pending);

      const { container, findByRole } = render(
        <TestProviders handler={handler} router={router} />,
      );

      await submitSearchQuery(container, "quantum");

      // Results are still in flight: the submit row shows the query but no
      // count bracket (unknown count is not "zero results").
      const submitRow = await findByRole("option", { name: /quantum/i });
      expect(submitRow.textContent).toContain("quantum");
      expect(submitRow.textContent).not.toContain("[");

      act(() => {
        resolveResults([makeCluster({ id: "c1" }), makeCluster({ id: "c2" })]);
      });

      await waitFor(() => {
        expect(submitRow.textContent?.includes("[")).toBe(true);
      });
    }),
  );

  it(
    "should keep previous results visible and show a spinner while the next query is in flight",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const router = buildTestRouter({
        i18n,
        config,
        children: <Search />,
      });

      let resolveSecond!: (value: Match[]) => void;
      const secondCall = new Promise<Match[]>((resolve) => {
        resolveSecond = resolve;
      });
      const handler = vi
        .fn()
        .mockReturnValueOnce([
          makeCluster({
            id: "c1",
            name: "Black Holes",
            displayName: "Black Holes",
          }),
          makeCluster({ id: "c2", name: "Quasars", displayName: "Quasars" }),
        ])
        .mockReturnValueOnce(secondCall);

      const { container, findAllByText, queryAllByText } = render(
        <TestProviders handler={handler} router={router} />,
      );
      const querySpinner = () =>
        document.querySelector('[aria-label="search.dropdown.loading"]');

      await submitSearchQuery(container, "black holes");
      await findAllByText("Black Holes");

      const input = await findSearchInput(container);
      const user = userEvent.setup();
      await user.type(input, " more");
      await act(() => new Promise((resolve) => setTimeout(resolve, 350)));

      expect(queryAllByText("Black Holes").length).toBeGreaterThan(0);
      expect(queryAllByText("Quasars").length).toBeGreaterThan(0);
      expect(querySpinner()).toBeTruthy();

      act(() => {
        resolveSecond([
          makeCluster({ id: "c3", name: "Pulsars", displayName: "Pulsars" }),
        ]);
      });

      await findAllByText("Pulsars");
      await waitFor(() => {
        expect(querySpinner()).toBeFalsy();
      });
    }),
  );

  it(
    "should shift the cluster panel only while the query is submittable",
    withStore(async () => {
      const i18n = await setupI18n();
      const { config } = baseConfig();
      const cluster = makeCluster({
        id: "c1",
        name: "Black Holes",
        displayName: "Black Holes",
      });
      const handler = (path: string) =>
        path === "cluster.byId" ? cluster : [cluster];
      const router = buildTestRouter({
        i18n,
        config,
        children: (
          <>
            <Search />
            <ContextPanelOutlet />
          </>
        ),
        initialUrl: "/cluster/c1",
      });

      const { container, findByTestId } = render(
        <TestProviders handler={handler} router={router} />,
      );

      const input = await findSearchInput(container);
      const panel = await findByTestId("context-panel");
      expect(panel.getAttribute("data-test-open")).toBe("true");
      expect(panel.getAttribute("data-test-shifted")).toBe("false");

      const user = userEvent.setup();
      await user.click(input);

      // Sub-threshold: the hint state does not shift the panel.
      await user.type(input, "bl");
      expect(panel.getAttribute("data-test-shifted")).toBe("false");

      // Submittable: the panel shifts right, beside the results.
      await user.type(input, "ack");
      await waitFor(() => {
        expect(panel.getAttribute("data-test-shifted")).toBe("true");
      });
      expect(panel.getAttribute("data-test-open")).toBe("true");

      // Clearing the query returns the panel to its docked position.
      await user.clear(input);
      await waitFor(() => {
        expect(panel.getAttribute("data-test-shifted")).toBe("false");
      });
      expect(panel.getAttribute("data-test-open")).toBe("true");
    }),
  );

  it(
    "should close the cluster panel on a map background tap while preserving the query",
    withStore(async () => {
      const i18n = await setupI18n();
      const { fake, config } = baseConfig();
      const cluster = makeCluster({
        id: "c1",
        name: "Black Holes",
        displayName: "Black Holes",
      });
      const handler = (path: string) =>
        path === "cluster.byId" ? cluster : [cluster];
      const router = buildTestRouter({
        i18n,
        config,
        children: (
          <>
            <Search />
            <ContextPanelOutlet />
          </>
        ),
        initialUrl: '/cluster/c1?q="black"',
      });

      const { findByTestId } = render(
        <TestProviders handler={handler} router={router} />,
      );

      const panel = await findByTestId("context-panel");
      expect(panel.getAttribute("data-test-open")).toBe("true");

      act(() => {
        fake.emitBackgroundTap();
      });

      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/");
      });
      expect(router.state.location.search.q).toBe("black");
      expect(panel.getAttribute("data-test-open")).toBe("false");

      // A tap once the panel is already closed is a harmless no-op.
      act(() => {
        fake.emitBackgroundTap();
      });
      expect(router.state.location.pathname).toBe("/");
      expect(router.state.location.search.q).toBe("black");
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
