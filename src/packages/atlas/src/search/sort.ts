import { z } from "zod";

export const sortValueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("relevance") }),
  z.object({
    kind: z.literal("articlesCount"),
    direction: z.enum(["asc", "desc"]),
  }),
]);

export type SortValue = z.infer<typeof sortValueSchema>;

export const DEFAULT_SORT: SortValue = { kind: "relevance" };
