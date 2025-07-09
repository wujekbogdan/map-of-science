import { config } from "../config.ts";
import { ClusterSearchResultSchema } from "./model";

export const clustersSearch = async (query: string) => {
  const params = new URLSearchParams({
    query,
    limit: "1000",
    scoreThreshold: "0.3",
  });
  console.time("clustersSearch");
  const results = await fetch(`${config.apiUrl}/clusters?${params.toString()}`);
  console.timeEnd("clustersSearch");

  console.time("parse clustersSearch results");
  const resultz = ClusterSearchResultSchema().parse(await results.json());
  console.timeEnd("parse clustersSearch results");
  return resultz;
};
