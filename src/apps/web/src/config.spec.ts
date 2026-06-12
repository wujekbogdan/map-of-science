import { describe, expect, it, vi } from "vitest";

// config.ts parses its sources at import time, so each case re-imports the
// module inside a scope with stubbed env/window that is torn down afterwards.
const withConfig = async (
  {
    runtime,
    env = {},
  }: {
    runtime?: Window["__APP_CONFIG__"];
    env?: Record<string, string>;
  },
  assert: (config: typeof import("./config.ts").config) => void,
) => {
  vi.resetModules();
  Object.entries(env).forEach(([key, value]) => vi.stubEnv(key, value));
  window.__APP_CONFIG__ = runtime;
  try {
    const { config } = await import("./config.ts");
    assert(config);
  } finally {
    vi.unstubAllEnvs();
    delete window.__APP_CONFIG__;
  }
};

describe("config", () => {
  it("should prefer runtime window config over build-time env", () =>
    withConfig(
      {
        runtime: { apiUrl: "http://runtime.example", devTool: "true" },
        env: { VITE_API_URL: "http://build-time.example" },
      },
      (config) => {
        expect(config.apiUrl).toBe("http://runtime.example");
        expect(config.devTool).toBe(true);
      },
    ));

  it("should fall back to build-time env when runtime config has no keys", () =>
    withConfig(
      {
        runtime: {},
        env: {
          VITE_API_URL: "http://build-time.example",
          VITE_DEV_TOOL_ENABLED: "true",
        },
      },
      (config) => {
        expect(config.apiUrl).toBe("http://build-time.example");
        expect(config.devTool).toBe(true);
      },
    ));

  it("should reject an empty runtime apiUrl instead of falling back", () =>
    expect(
      withConfig(
        {
          runtime: { apiUrl: "" },
          env: { VITE_API_URL: "http://build-time.example" },
        },
        () => expect.unreachable("config parsing should have thrown"),
      ),
    ).rejects.toThrow());
});
