import { z } from "zod";

export const sortSelectionSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("relevance") }),
  z.strictObject({
    kind: z.literal("articlesCount"),
    direction: z.enum(["asc", "desc"]),
  }),
]);

export type SortSelection = z.infer<typeof sortSelectionSchema>;
