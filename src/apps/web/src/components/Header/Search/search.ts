import { normalizeSync } from "normalize-diacritics";
import { clustersSearch } from "../../../api/clusters-search.ts";
import { AreaLocalized } from "../../../api/data.ts";
import { Concept, Cluster, YoutubeVideo } from "../../../api/model";

export type LabelModel = ReturnType<typeof createLabelsCollection>[number];

type ConceptWithClustersModel = {
  id: number;
  name: string;
  clusters: {
    clusterId: number;
    x: number;
    y: number;
  }[];
  articlesCount: number;
};

// FIXME: This isn't exactly right. The code assumes that the model never changes.
// It's true in practice, but in theory one could call the search function with
// a different map parameter each time.
let cachedLabelsCollection: LabelModel[] | null = null;

/**
 * Normalize a string by removing diacritics and converting to lowercase.
 */
const normalize = (str: string) =>
  normalizeSync(str.replace("#", "").toLowerCase());

export const createLabelsCollection = (
  areas: AreaLocalized[],
  youtube: Map<string, YoutubeVideo[]>,
) =>
  areas.map((area) => ({
    ...area,
    label: area.text,
    normalizedLabel: normalize(area.text),
    videosCount: youtube.get(area.id)?.length ?? 0,
  }));

export const createClustersByConcept = (
  clusters: Cluster[],
  concepts: Map<number, Concept>,
) => {
  const clustersByConcept = new Map<number, ConceptWithClustersModel>();

  console.time("createClustersByConcept");
  // DO NOT rewrite this in an immutable way. Using reduce immutably would require constructing
  // a new object for each conceptId, which has a *massive* performance cost - orders of magnitude slower.
  clusters.forEach(({ keyConcepts, clusterId, x, y, articlesCount }) => {
    keyConcepts.forEach((conceptId) => {
      if (!clustersByConcept.has(conceptId)) {
        const name = concepts.get(conceptId)?.key ?? "UNKNOWN";
        clustersByConcept.set(conceptId, {
          id: conceptId,
          articlesCount: articlesCount,
          name,
          clusters: [],
        });
      }
      clustersByConcept.get(conceptId)?.clusters.push({
        clusterId,
        x,
        y,
      });
    });
  });
  console.timeEnd("createClustersByConcept");

  return [...clustersByConcept.values()];
};

type Options = {
  areas: AreaLocalized[];
  clusters: Map<number, Cluster>;
  concepts: Map<number, Concept>;
  youtube: Map<string, YoutubeVideo[]>;
};

export const search = async (options: Options, phrase: string) => {
  const results = await clustersSearch(phrase);
  const clusters = results
    .map(({ id }) => options.clusters.get(id))
    .filter((cluster) => cluster !== undefined);

  const labelsCollection =
    cachedLabelsCollection ??
    (cachedLabelsCollection = createLabelsCollection(
      options.areas,
      options.youtube,
    ));

  if (!phrase)
    return {
      labels: [],
      points: [],
    };

  const clustersByConcept = createClustersByConcept(clusters, options.concepts);
  const normalizedPhrase = normalize(phrase).toLowerCase();

  const points = () => {
    const LIMIT = 300;
    // TODO: Implement a better/more efficient way to filter and sort the
    // results.
    return clustersByConcept
      .sort((a, b) => b.clusters.length - a.clusters.length)
      .slice(0, LIMIT);
  };

  return {
    labels: labelsCollection.filter(({ normalizedLabel }) =>
      normalizedLabel.includes(normalizedPhrase),
    ),
    points: points(),
  };
};
