import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { areaRouter } from "./area/area.js";
import { clusterRouter } from "./cluster/cluster.js";
import { contentRouter } from "./content/content.js";
import { searchRouter } from "./search/search.js";
import { createCallerFactory, router } from "./trpc.js";

export const appRouter = router({
  cluster: clusterRouter,
  area: areaRouter,
  content: contentRouter,
  search: searchRouter,
});

export type Router = typeof appRouter;
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;

export const createCaller = createCallerFactory(appRouter);
