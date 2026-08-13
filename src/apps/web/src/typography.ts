/*
 * The app's baseline grid and type scale, so that text keeps one rhythm in every panel.
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
