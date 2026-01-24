import { z } from "zod";
import { baselinePrompt } from "./baseline.js";

const MIXED_CLUSTER_LABEL = "Mixed or noisy cluster";
const DEFAULT_MAX_TITLES = 10;

const labelSchema = z.object({
  english: z.string().min(3).max(120),
});

type LabelSchema = typeof labelSchema;

type GenerateFn = (params: {
  prompt: string;
  schema: LabelSchema;
  temperature: number;
}) => Promise<{
  object: z.infer<LabelSchema>;
  price: { raw: number; formatted: string };
}>;

const deduplicateTitles = (titles: string[]) => [...new Set(titles)];

const capitalizeFirst = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const createClusterNamer =
  (deps: { generate: GenerateFn }) =>
  async (
    cluster: { id: string; titles: string[] },
    options: {
      maxTitles?: number;
      buildPrompt?: (titles: string[]) => string;
    } = {},
  ) => {
    const maxTitles = options.maxTitles ?? DEFAULT_MAX_TITLES;
    const buildPrompt = options.buildPrompt ?? baselinePrompt;

    const uniqueTitles = deduplicateTitles(cluster.titles).slice(0, maxTitles);

    if (uniqueTitles.length === 0) {
      return {
        data: {
          id: cluster.id,
          label: MIXED_CLUSTER_LABEL,
        },
        price: { raw: 0, formatted: "$0.00" },
      };
    }

    const prompt = buildPrompt(uniqueTitles);

    const { object, price } = await deps.generate({
      prompt,
      schema: labelSchema,
      temperature: 0,
    });

    const label = capitalizeFirst(object.english.trim());

    return {
      data: {
        id: cluster.id,
        label,
      },
      price,
    };
  };
