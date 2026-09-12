import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { appRouter, createContext } from "@map-of-science/api";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { createHealthRoutes } from "./healthRoutes.js";

export const createServer = ({
  atlas,
  search,
  isReady,
}: {
  atlas: AtlasStore;
  search: Search;
  isReady: () => Promise<boolean>;
}) => {
  const corsMiddleware = cors();
  const healthRoutes = createHealthRoutes({ isReady });

  return createHTTPServer({
    middleware: (req, res, next) =>
      corsMiddleware(req, res, () => healthRoutes(req, res, next)),
    router: appRouter,
    createContext: ({ req }) => createContext({ req, atlas, search }),
  });
};
