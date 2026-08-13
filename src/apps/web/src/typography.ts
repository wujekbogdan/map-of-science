/*
 * The app's baseline grid and type scale.
 *
 * Sizes step by 1.125 from the body size, which gives 14, 16 and 18.
 * That is the smallest of the usual ratios, and it suits an interface that carries data rather than display type.
 * A larger ratio, such as the golden ratio, passes a readable heading size within two steps.
 *
 * Every line height and every spacing step is a whole number of baselines, so a line of text stays on the grid however long a value wraps.
 *
 * Sizes and spacing only. Weight, colour and borders are the choice of each component.
 */

const BASELINE_PX = 4;

const baselines = (count: number) => `${(count * BASELINE_PX).toString()}px`;

const BODY_FONT_SIZE_PX = 14;

export const rhythm = {
  body: { fontSizePx: BODY_FONT_SIZE_PX, lineHeight: baselines(5) },
  subHeading: { fontSizePx: BODY_FONT_SIZE_PX, lineHeight: baselines(5) },
  sectionHeading: { fontSizePx: 16, lineHeight: baselines(5) },
  panelTitle: { fontSizePx: 18, lineHeight: baselines(6) },
  space: {
    aboveBody: baselines(3),
    betweenSections: baselines(5),
    afterHeading: baselines(1),
    beforeSubHeading: baselines(3),
    withinRow: baselines(1),
    betweenListItems: baselines(1),
    labelColumnGap: baselines(3),
    listIndent: baselines(4),
  },
} as const;
