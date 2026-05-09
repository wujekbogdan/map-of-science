import {
  createRootRoute,
  createRouter,
  createMemoryHistory,
} from "@tanstack/react-router";
import App from "./components/App.tsx";
import { searchParamsSchema } from "./components/Header/Search/searchParams.ts";

export const rootRoute = createRootRoute({
  validateSearch: searchParamsSchema,
  component: App,
});

const routeTree = rootRoute;

export const createAppRouter = (initialEntries?: string[]) =>
  createRouter({
    routeTree,
    history: initialEntries
      ? createMemoryHistory({ initialEntries })
      : undefined,
  });

export const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
