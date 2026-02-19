import { describe, it, expect } from "vitest";
import { withRequestInterception } from "@map-of-science/test-utils";
import { createFetchWorks } from "./works.js";

const BASE_URL = "https://api.openalex.org";

const createClient = () =>
  createFetchWorks({ apiKey: "test-key", email: "test@example.com" });

describe("fetchWorks error handling", () => {
  it(
    "should throw on 401 invalid API key",
    withRequestInterception(
      ({ http, HttpResponse }) => [
        http.get(`${BASE_URL}/works`, () =>
          HttpResponse.json({}, { status: 401 }),
        ),
      ],
      async () => {
        const fetchWorks = createClient();

        await expect(
          fetchWorks(["https://doi.org/10.1234/test"]),
        ).rejects.toThrow("OpenAlex: invalid API key");
      },
    ),
  );

  it(
    "should throw on 429 rate limit exceeded",
    withRequestInterception(
      ({ http, HttpResponse }) => [
        http.get(`${BASE_URL}/works`, () =>
          HttpResponse.json({}, { status: 429 }),
        ),
      ],
      async () => {
        const fetchWorks = createClient();

        await expect(
          fetchWorks(["https://doi.org/10.1234/test"]),
        ).rejects.toThrow("OpenAlex: rate limit exceeded");
      },
    ),
  );

  it(
    "should throw on 500 server error",
    withRequestInterception(
      ({ http, HttpResponse }) => [
        http.get(`${BASE_URL}/works`, () =>
          HttpResponse.json({}, { status: 500 }),
        ),
      ],
      async () => {
        const fetchWorks = createClient();

        await expect(
          fetchWorks(["https://doi.org/10.1234/test"]),
        ).rejects.toThrow("OpenAlex: request failed with status 500");
      },
    ),
  );
});
