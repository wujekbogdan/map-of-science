import pino from "pino";

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export const createLogger = (level: LogLevel = "info") =>
  pino({
    level,
  });

export type Logger = ReturnType<typeof createLogger>;
