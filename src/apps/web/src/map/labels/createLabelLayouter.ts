import {
  computeLabelLayout,
  type LabelLayout,
  type MeasureText,
} from "./computeLabelLayout.ts";

const CACHE_CAP = 5_000;

export const createLabelLayouter = ({
  measureText,
}: {
  measureText: MeasureText;
}) => {
  const cache = new Map<string, LabelLayout>();

  return (text: string, budgetPx: number) => {
    const key = `${text}|${budgetPx.toString()}`;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;

    const layout = computeLabelLayout({ text, budgetPx, measureText });

    if (cache.size >= CACHE_CAP) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, layout);
    return layout;
  };
};
