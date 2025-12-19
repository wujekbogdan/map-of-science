import { describe, it, expect } from "vitest";
import { createLogger } from "./createLogger.js";

describe("createLogger", () => {
  it("should create logger with default level", () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
    expect(logger.level).toBe("info");
  });

  it("should create logger with specified level", () => {
    const logger = createLogger("debug");
    expect(logger.level).toBe("debug");
  });

  it("should have standard log methods", () => {
    const logger = createLogger();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.trace).toBeDefined();
    expect(logger.fatal).toBeDefined();
  });
});
