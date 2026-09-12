import { createURL } from "@trpc/server/adapters/node-http";
import type { IncomingMessage, ServerResponse } from "node:http";

/* tRPC has this type as `ConnectMiddleware`, but does not export it. */
type Middleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: (error?: unknown) => void,
) => void;

const respond = (response: ServerResponse, status: number) => {
  response.writeHead(status, { "content-length": 0 });
  response.end();
};

const respondToReadiness = async (
  response: ServerResponse,
  isReady: () => Promise<boolean>,
) => {
  try {
    respond(response, (await isReady()) ? 200 : 503);
  } catch {
    respond(response, 503);
  }
};

export const createHealthRoutes =
  ({ isReady }: { isReady: () => Promise<boolean> }): Middleware =>
  (request, response, next) => {
    const { pathname } = createURL(request);

    if (pathname === "/health") {
      respond(response, 200);
      return;
    }

    if (pathname === "/ready") {
      void respondToReadiness(response, isReady);
      return;
    }

    next();
  };
