import PQueue from "p-queue";

export const createRateLimitedFunction = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  requestsPerMinute = 10,
) => {
  const queue = new PQueue({
    interval: 60_000, // 1 minute in milliseconds
    intervalCap: requestsPerMinute,
  });

  return (...args: TArgs): Promise<TReturn> => {
    return queue.add(() => fn(...args));
  };
};
