import { z } from "zod";
import { type SortSelection, sortSelectionSchema } from "./sortSelection.ts";

const sortStringSchema = z.preprocess((raw) => {
  if (typeof raw !== "string") return null;
  const [kind, ...rest] = raw.split(".");
  return rest.length ? { kind, direction: rest.join(".") } : { kind };
}, sortSelectionSchema);

export const encodeSort = (value: SortSelection): string =>
  "direction" in value ? `${value.kind}.${value.direction}` : value.kind;

export const decodeSort = (raw: unknown): SortSelection | undefined =>
  sortStringSchema.safeParse(raw).data;
