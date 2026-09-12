import type { AddressInfo } from "node:net";
import { describe, expect, it, vi, type Mock } from "vitest";
import type { Search } from "@map-of-science/atlas";
import type { AtlasStore } from "@map-of-science/atlas-store";
import { createServer } from "./server.js";

const buildAtlas = () =>
  ({
    areas: { findById: vi.fn().mockResolvedValue(null) },
  }) as unknown as AtlasStore;

type Request = (path: string) => Promise<Response>;
type IsReady = Mock<() => Promise<boolean>>;

const withServer =
  (test: (context: { request: Request; isReady: IsReady }) => Promise<void>) =>
  async () => {
    const isReady: IsReady = vi.fn();
    const server = createServer({
      atlas: buildAtlas(),
      search: {} as Search,
      isReady,
    });
    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });
    const { port } = server.address() as AddressInfo;
    expect.hasAssertions();
    try {
      await test({
        request: (path) => fetch(`http://127.0.0.1:${port}${path}`),
        isReady,
      });
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  };

const trpcQuery = (procedure: string, input: unknown) =>
  `/${procedure}?input=${encodeURIComponent(JSON.stringify(input))}`;

describe("createServer", () => {
  it(
    "should respond to a tRPC procedure call through the router",
    withServer(async ({ request }) => {
      const response = await request(trpcQuery("area.byId", { id: "a-1" }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        result: { data: null },
      });
    }),
  );

  it(
    "should forward /health/ to the tRPC router, matching endpoint paths exactly",
    withServer(async ({ request }) => {
      const response = await request("/health/");

      expect(response.status).toBe(404);
    }),
  );

  it(
    "should respond to /health with status 200 and an empty body, without invoking the readiness probe",
    withServer(async ({ request, isReady }) => {
      const response = await request("/health");

      expect(response.status).toBe(200);
      expect(response.headers.get("content-length")).toBe("0");
      await expect(response.text()).resolves.toBe("");
      expect(isReady).not.toHaveBeenCalled();
    }),
  );

  it(
    "should respond to /ready with status 200 when the readiness probe reports ready",
    withServer(async ({ request, isReady }) => {
      isReady.mockResolvedValueOnce(true);

      const response = await request("/ready");

      expect(response.status).toBe(200);
    }),
  );

  it(
    "should respond to /ready with status 503 when the readiness probe reports not ready",
    withServer(async ({ request, isReady }) => {
      isReady.mockResolvedValueOnce(false);

      const response = await request("/ready");

      expect(response.status).toBe(503);
    }),
  );

  it(
    "should respond to /ready with status 503 when the readiness probe throws",
    withServer(async ({ request, isReady }) => {
      isReady.mockRejectedValueOnce(new Error("qdrant is down"));

      const response = await request("/ready");

      expect(response.status).toBe(503);
    }),
  );
});
