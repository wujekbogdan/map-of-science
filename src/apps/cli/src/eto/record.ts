import { z } from "zod";
import type { ParsedCluster } from "@map-of-science/eto-cluster-parser";

// Pin the article shape to `ParsedCluster`. Drop `title` from the parser output
// and the build breaks, instead of records quietly failing to validate.
const articleTitleSchema: z.ZodType<
  Pick<ParsedCluster["articles"]["core"][number], "title">
> = z.object({ title: z.string() });

export const etoRecordSchema = z
  .object({
    id: z.number(),
    articles: z.object({
      core: z.array(articleTitleSchema),
      review: z.array(articleTitleSchema),
      highlyCited: z.array(articleTitleSchema),
    }),
  })
  .transform(({ id, articles }) => ({
    id,
    titles: [...articles.core, ...articles.review, ...articles.highlyCited].map(
      ({ title }) => title,
    ),
  }));
