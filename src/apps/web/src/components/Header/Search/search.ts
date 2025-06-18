import { normalizeSync } from "normalize-diacritics";
import {
  AreaLabel,
  AreaLabelI18n,
  Concept,
  DataPoint,
  YoutubeVideo,
} from "../../../api/model";
import { config } from "../../../config.ts";

export type LabelModel = ReturnType<typeof createLabelsCollection>[number];

type ConceptWithClustersModel = {
  id: number;
  name: string;
  nameNormalized: string;
  clusters: {
    clusterId: number;
    x: number;
    y: number;
  }[];
  articlesCount: number;
};
type ConceptId = number;

// FIXME: This isn't exactly right. The code assumes that the model never changes.
// It's true in practice, but in theory one could call the search function with
// a different map parameter each time.
let cachedLabelsCollection: LabelModel[] | null = null;
let cachedClustersByConcept: Map<ConceptId, ConceptWithClustersModel> | null =
  null;

/**
 * Normalize a string by removing diacritics and converting to lowercase.
 */
const normalize = (str: string) =>
  normalizeSync(str.replace("#", "").toLowerCase());

export const createLabelsCollection = (
  labels: Map<string, AreaLabel>,
  labelsI18n: Map<string, AreaLabelI18n>,
  youtube: Map<string, YoutubeVideo[]>,
) =>
  [...labels.values()].map((label) => {
    const name = labelsI18n.get(label.id)?.[config.LANG] ?? label.id;
    return {
      ...label,
      label: name,
      normalizedLabel: normalize(name),
      videosCount: youtube.get(label.id)?.length ?? 0,
    };
  });

export const createClustersByConcept = (
  dataPoints: Map<number, DataPoint>,
  concepts: Map<number, Concept>,
) => {
  const result = new Map<number, ConceptWithClustersModel>();

  // DO NOT rewrite this in an immutable way. Using reduce immutably would require constructing
  // a new object for each conceptId, which has a *massive* performance cost - orders of magnitude slower.
  [...dataPoints.values()].forEach(
    ({ keyConcepts, clusterId, x, y, numRecentArticles }) => {
      keyConcepts.forEach((conceptId) => {
        if (!result.has(conceptId)) {
          const name = concepts.get(conceptId)?.key ?? "UNKNOWN";
          result.set(conceptId, {
            id: conceptId,
            articlesCount: numRecentArticles,
            name,
            // TODO: normalizeSync seems to be very slow. Let's use toLowerCase
            // for now, but look for a better solution later.
            nameNormalized: name.toLowerCase(),
            clusters: [],
          });
        }
        result.get(conceptId)?.clusters.push({
          clusterId,
          x,
          y,
        });
      });
    },
  );

  return result;
};

type Options = {
  labels: Map<string, AreaLabel>;
  labelsI18n: Map<string, AreaLabelI18n>;
  dataPoints: Map<number, DataPoint>;
  concepts: Map<number, Concept>;
  youtube: Map<string, YoutubeVideo[]>;
};

export const search = (options: Options, phrase: string) => {
  const labelsCollection =
    cachedLabelsCollection ??
    (cachedLabelsCollection = createLabelsCollection(
      options.labels,
      options.labelsI18n,
      options.youtube,
    ));
  const clustersByConcept =
    cachedClustersByConcept ??
    (cachedClustersByConcept = createClustersByConcept(
      options.dataPoints,
      options.concepts,
    ));

  if (!phrase)
    return {
      labels: [],
      points: [],
    };

  const normalizedPhrase = normalize(phrase).toLowerCase();

  const points = () => {
    const results = [...clustersByConcept.values()].filter(
      ({ nameNormalized }) => {
        return nameNormalized.includes(normalizedPhrase);
      },
    );

    const LIMIT = 300;
    // TODO: Implement a better/more efficient way to filter and sort the
    // results. Fuse.js maybe?
    // https://github.com/users/wujekbogdan/projects/1/views/1?pane=issue&itemId=110658002
    return results
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
