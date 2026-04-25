import { LINE_HEIGHT, REF_FONT_SIZE } from "./config.ts";

export type MeasureText = (text: string) => number;

export const computeLabelLayout = ({
  text,
  budgetPx,
  measureText,
}: {
  text: string;
  budgetPx: number;
  measureText: MeasureText;
}) => {
  const words = text.split(" ");

  const packed = words.reduce<{ lines: string[]; current: string }>(
    (acc, word) => {
      if (acc.current === "") return { lines: acc.lines, current: word };
      const next = `${acc.current} ${word}`;
      return measureText(next) <= budgetPx
        ? { lines: acc.lines, current: next }
        : { lines: [...acc.lines, acc.current], current: word };
    },
    { lines: [], current: "" },
  );

  const lines =
    packed.current === "" ? packed.lines : [...packed.lines, packed.current];

  const widthAtRefFont = lines.reduce(
    (max, line) => Math.max(max, measureText(line)),
    0,
  );
  const heightAtRefFont = lines.length * REF_FONT_SIZE * LINE_HEIGHT;

  return { lines, widthAtRefFont, heightAtRefFont };
};

export type LabelLayout = ReturnType<typeof computeLabelLayout>;
