import { createFetchWorks } from "./works.js";

type Config = {
  apiKey: string;
  email: string;
};

export const createOpenAlexClient = (config: Config) => ({
  fetchWorks: createFetchWorks(config),
});
