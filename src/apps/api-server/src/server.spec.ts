import type { AddressInfo } from "node:net";
import { describe, expect, it, vi } from "vitest";
import { startServer } from "./server.js";

const withServer = (test: (server: ReturnType<typeof startServer>) => void) => {
  return () => {
    vi.stubEnv("SERVER_PORT", "0");
    vi.stubEnv("QDRANT_URL", "http://localhost:6333");
    vi.stubEnv("QDRANT_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "test-key");
    const server = startServer();
    expect.hasAssertions();
    try {
      test(server);
    } finally {
      server.close();
    }
  };
};

describe("startServer", () => {
  it(
    "should listen on the configured port with atlas and search wired",
    withServer((server) => {
      expect(server.listening).toBe(true);
      expect((server.address() as AddressInfo).port).toBeGreaterThan(0);
    }),
  );
});
