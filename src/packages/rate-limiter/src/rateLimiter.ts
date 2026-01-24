import Bottleneck from "bottleneck";

export const createRateLimitedFunction = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  requestsPerMinute = 10,
): ((...args: TArgs) => Promise<TReturn>) => {
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: Math.ceil(60_000 / requestsPerMinute),
  });

  return (...args: TArgs): Promise<TReturn> =>
    limiter.schedule(() => fn(...args));
};
