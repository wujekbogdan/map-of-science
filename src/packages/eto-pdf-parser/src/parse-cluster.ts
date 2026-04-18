import { extractText } from "./extract.js";

export class ArticleCountMismatchError extends Error {
  constructor(
    public readonly section: string,
    public readonly expected: number,
    public readonly actual: number,
  ) {
    super(
      `Section "${section}": expected ${expected} articles, parsed ${actual}`,
    );
    this.name = "ArticleCountMismatchError";
  }
}

const CLUSTER_ID_PATTERN = /Cluster (\d+)/;
const TOTAL_ARTICLES_PATTERN = /(\d+) recent articles in the cluster/;
// Matches article metadata in three formats:
// - Long: "2021: Journal Name. 271 citations." (year, journal, citations)
// - Short: "2021. 271 citations." (year, citations - no journal)
// - RTL: "2021: 5 مجلة عربية. citations." (RTL text causes citation count to appear after year)
//
// Pattern requirements:
// - \b word boundary prevents matching years embedded in identifiers (ITRF2020:)
// - (19|20)\d{2} only matches valid publication years 1900-2099
// - Negative lookahead (?!\b(19|20)\d{2}:) ensures we don't match when title
//   contains a year pattern (e.g., "iProX in 2021: connecting..." should not
//   split at the first 2021:)
const METADATA_LONG_FORMAT =
  /\b(?:19|20)\d{2}:\s(?:(?!\b(?:19|20)\d{2}:).)+?\.\s\d+\scitations?\./;
const METADATA_SHORT_FORMAT = /\b(?:19|20)\d{2}\.\s\d+\scitations?\./;
// RTL format: when PDF contains right-to-left text (Arabic, Hebrew), the citation count
// gets displaced to appear right after the year instead of before "citations."
// Example: "2022: 1 المجلة العلمية. citations." instead of "2022: المجلة العلمية. 1 citations."
const METADATA_RTL_FORMAT = /\b(?:19|20)\d{2}:\s\d+\s[^.]+\.\scitations\./;
const METADATA_PATTERN = new RegExp(
  `${METADATA_LONG_FORMAT.source}|${METADATA_SHORT_FORMAT.source}|${METADATA_RTL_FORMAT.source}`,
);
// Citation markers: normal format "N citations." and RTL format ". citations." (number displaced)
const CITATION_MARKER_PATTERN = /\d+\scitations?\./g;
const CITATION_MARKER_RTL_PATTERN = /\.\scitations\./g;
const NO_DATA_TEXT = "No data available.";

const countCitationMarkers = (text: string) => {
  const normalCount = (text.match(CITATION_MARKER_PATTERN) ?? []).length;
  const rtlCount = (text.match(CITATION_MARKER_RTL_PATTERN) ?? []).length;
  return normalCount + rtlCount;
};

const SECTION_MARKERS = {
  core: "Core articles",
  review: "Review articles",
  highlyCited: "Highly cited articles",
  topSources: "Top sources",
} as const;

const DESCRIPTION_TEXTS = [
  "Core articles are especially highly connected to other papers within the cluster.",
  "Review articles have between 100 and 1000 out-citations. These articles describe and systematize other contributors' research.",
  "Highly cited articles are the articles in the cluster with the most citations overall.",
];

const createNumberExtractor =
  ({ pattern, errorMessage }: { pattern: RegExp; errorMessage: string }) =>
  (text: string) => {
    const match = pattern.exec(text);
    if (!match) {
      throw new Error(errorMessage);
    }
    return Number.parseInt(match[1], 10);
  };

const extractClusterId = createNumberExtractor({
  pattern: CLUSTER_ID_PATTERN,
  errorMessage: "Could not find cluster ID in PDF",
});

const extractTotalArticles = createNumberExtractor({
  pattern: TOTAL_ARTICLES_PATTERN,
  errorMessage: "Could not find total articles count in PDF",
});

const findSectionBounds = ({
  text,
  sectionMarker,
  endMarkers,
}: {
  text: string;
  sectionMarker: string;
  endMarkers: string[];
}) => {
  const sectionStart = text.indexOf(sectionMarker);
  if (sectionStart === -1) {
    return null;
  }

  const contentStart = sectionStart + sectionMarker.length;
  const sectionEnd = endMarkers.reduce((minEnd, marker) => {
    const markerPos = text.indexOf(marker, contentStart);
    return markerPos !== -1 && markerPos < minEnd ? markerPos : minEnd;
  }, text.length);

  return { start: contentStart, end: sectionEnd };
};

const removeDescriptions = (text: string) =>
  DESCRIPTION_TEXTS.reduce((acc, desc) => acc.replace(desc, ""), text);

const isAllCaps = (text: string) =>
  text === text.toUpperCase() && text !== text.toLowerCase();

const toSentenceCase = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const normalizeTitle = (title: string) =>
  isAllCaps(title) ? toSentenceCase(title) : title;

const parseTitlesFromSection = (sectionText: string) => {
  const cleaned = removeDescriptions(sectionText);

  if (!METADATA_PATTERN.test(cleaned)) {
    return [];
  }

  return cleaned
    .split(METADATA_PATTERN)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(normalizeTitle);
};

const createSectionExtractor =
  ({
    sectionMarker,
    endMarkers,
  }: {
    sectionMarker: string;
    endMarkers: string[];
  }) =>
  (text: string) => {
    const bounds = findSectionBounds({ text, sectionMarker, endMarkers });
    if (!bounds) {
      return [];
    }

    const sectionText = text.slice(bounds.start, bounds.end);
    if (sectionText.includes(NO_DATA_TEXT)) {
      return [];
    }

    const titles = parseTitlesFromSection(sectionText);
    const expectedCount = countCitationMarkers(sectionText);

    // We validate that parsed title count does not exceed the expected count based on
    // citation markers. If we parse MORE titles than markers, it indicates a bug in
    // our parsing logic (e.g., incorrectly splitting a single title into multiple).
    //
    // However, we allow parsing FEWER titles than markers. Some ETO source PDFs contain
    // entries where the article title is missing but the metadata (year, journal, citation
    // count) is present. This results in consecutive citation markers with no title text
    // between them, e.g:
    //   Title A 2020:
    //   Journal X. 5 citations.
    //   2021: Journal Y. 3 citations.
    //   Title B
    // In such cases, the citation marker count is higher than the actual title count.
    // This is a data quality issue in the source PDFs, not a parser bug.
    if (titles.length > expectedCount) {
      throw new ArticleCountMismatchError(
        sectionMarker,
        expectedCount,
        titles.length,
      );
    }

    return titles;
  };

const extractCoreTitles = createSectionExtractor({
  sectionMarker: SECTION_MARKERS.core,
  endMarkers: [SECTION_MARKERS.review],
});

const extractReviewTitles = createSectionExtractor({
  sectionMarker: SECTION_MARKERS.review,
  endMarkers: [SECTION_MARKERS.highlyCited],
});

const extractHighlyCitedTitles = createSectionExtractor({
  sectionMarker: SECTION_MARKERS.highlyCited,
  endMarkers: [SECTION_MARKERS.topSources],
});

export const parseClusterPdf = async (data: Uint8Array) => {
  const text = await extractText(data);

  return {
    id: extractClusterId(text),
    totalArticles: extractTotalArticles(text),
    articles: {
      core: extractCoreTitles(text),
      review: extractReviewTitles(text),
      highlyCited: extractHighlyCitedTitles(text),
    },
  };
};
