import { extractClusterDocument } from "./extract.js";

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
const AVERAGE_ARTICLE_AGE_PATTERN =
  /Average article is (\d+(?:\.\d+)?) years old/;
const CITATION_RATING_PATTERN =
  /Citation rating:\s*(\d+(?:\.\d+)?)th percentile/;
const PATENT_RATING_PATTERN =
  /\(\s*(\d+(?:\.\d+)?)th percentile among all clusters\)/;
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
  ({
    pattern,
    errorMessage,
    parse = (value: string) => Number.parseInt(value, 10),
  }: {
    pattern: RegExp;
    errorMessage: string;
    parse?: (value: string) => number;
  }) =>
  (text: string) => {
    const match = pattern.exec(text);
    if (!match) {
      throw new Error(errorMessage);
    }
    return parse(match[1]);
  };

const extractClusterId = createNumberExtractor({
  pattern: CLUSTER_ID_PATTERN,
  errorMessage: "Could not find cluster ID in PDF",
});

const extractTotalArticles = createNumberExtractor({
  pattern: TOTAL_ARTICLES_PATTERN,
  errorMessage: "Could not find total articles count in PDF",
});

const extractAverageArticleAgeYears = createNumberExtractor({
  pattern: AVERAGE_ARTICLE_AGE_PATTERN,
  errorMessage: "Could not find average article age in PDF",
  parse: Number.parseFloat,
});

const extractCitationRatingPercentile = createNumberExtractor({
  pattern: CITATION_RATING_PATTERN,
  errorMessage: "Could not find citation rating percentile in PDF",
  parse: Number.parseFloat,
});

const extractPatentRatingPercentile = createNumberExtractor({
  pattern: PATENT_RATING_PATTERN,
  errorMessage: "Could not find patent rating percentile in PDF",
  parse: Number.parseFloat,
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

// The citation count trails the metadata blob ("… Journal. 74 citations."), except
// in RTL text where it is displaced to right after the year ("2022: 1 Journal. citations.").
const TRAILING_CITATION_COUNT = /(\d+)\s+citations?\.\s*$/i;
const DISPLACED_CITATION_COUNT = /^(?:19|20)\d{2}:\s*(\d+)\b/;
const TRAILING_CITATION_SEGMENT = /\.\s*(?:\d+\s+)?citations?\.\s*$/i;

const extractCitationCount = (metadata: string) => {
  const trailing = TRAILING_CITATION_COUNT.exec(metadata);
  const displaced = DISPLACED_CITATION_COUNT.exec(metadata);
  const matched = trailing ?? displaced;
  return matched ? Number.parseInt(matched[1], 10) : 0;
};

const stripCitationCount = (metadata: string) =>
  metadata.replace(TRAILING_CITATION_SEGMENT, "").trim();

const matchEnd = (match: RegExpExecArray) => match.index + match[0].length;

type DoiResolver = (title: string) => string | null;

// The DOI links carry the title rebuilt from the PDF annotation layer; an article is
// matched to its DOI by comparing those titles, ignoring case and punctuation so the
// reconstructed text (which can be all-caps or have glyph spacing quirks) still lines up.
const normalizeForDoiMatch = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]/g, "");

const createDoiResolver = (
  doiLinks: { doi: string; title: string }[],
): DoiResolver => {
  const linkKeys = doiLinks.map(({ doi, title }) => ({
    doi,
    key: normalizeForDoiMatch(title),
  }));

  return (title) => {
    const key = normalizeForDoiMatch(title);
    if (!key) {
      return null;
    }
    // A multi-line title's reconstructed text is the title possibly followed by a partial
    // repeat, so prefer an exact key and fall back to a prefix match.
    const match =
      linkKeys.find((link) => link.key === key) ??
      linkKeys.find((link) => link.key.startsWith(key));
    return match ? match.doi : null;
  };
};

const toArticleEntry = (blob: string, title: string) => ({
  title: normalizeTitle(title),
  metadata: stripCitationCount(blob),
  citations: extractCitationCount(blob),
});

const parseArticlesFromSection = (sectionText: string) => {
  const cleaned = removeDescriptions(sectionText);
  const matches = [
    ...cleaned.matchAll(new RegExp(METADATA_PATTERN.source, "g")),
  ];

  return (
    matches
      .map((match, index) => {
        const titleStart = index === 0 ? 0 : matchEnd(matches[index - 1]);
        return {
          blob: match[0],
          title: cleaned.slice(titleStart, match.index).trim(),
        };
      })
      // A missing title (consecutive metadata blobs) is a source data quirk - drop it
      // rather than emitting a titleless entry.
      .filter(({ title }) => title.length > 0)
      .map(({ blob, title }) => toArticleEntry(blob, title))
  );
};

// Joins the text layer to the annotation layer: each parsed article gets the DOI whose
// reconstructed title matches, or null when the title was not a link.
const resolveArticleDois = (
  articles: ReturnType<typeof parseArticlesFromSection>,
  resolveDoi: DoiResolver,
) =>
  articles.map((article) => ({ ...article, doi: resolveDoi(article.title) }));

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

    const entries = parseArticlesFromSection(sectionText);
    const expectedCount = countCitationMarkers(sectionText);

    // We validate that the parsed entry count does not exceed the expected count based on
    // citation markers. If we parse MORE entries than markers, it indicates a bug in
    // our parsing logic (e.g., incorrectly splitting a single title into multiple).
    //
    // However, we allow parsing FEWER entries than markers. Some ETO source PDFs contain
    // entries where the article title is missing but the metadata (year, journal, citation
    // count) is present. This results in consecutive citation markers with no title text
    // between them, e.g:
    //   Title A 2020:
    //   Journal X. 5 citations.
    //   2021: Journal Y. 3 citations.
    //   Title B
    // In such cases, the citation marker count is higher than the actual entry count.
    // This is a data quality issue in the source PDFs, not a parser bug.
    if (entries.length > expectedCount) {
      throw new ArticleCountMismatchError(
        sectionMarker,
        expectedCount,
        entries.length,
      );
    }

    return entries;
  };

const SOURCE_HEADER = "Source Articles (last five years) ";
const SOURCE_END = "Authors, organizations, and funders";

const isInteger = (token: string) => /^\d+$/.test(token);

// Words whose trailing number belongs to the name, not the article count ("Day 3", "Volume 2").
const NAME_QUALIFIERS = new Set([
  "Day",
  "Volume",
  "Vol",
  "Vol.",
  "vol",
  "vol.",
]);
// A number right before a weekday is a day-of-month in a date ("Day 3 Wed, November ..."), not a count.
const WEEKDAYS = new Set([
  "Mon,",
  "Tue,",
  "Wed,",
  "Thu,",
  "Fri,",
  "Sat,",
  "Sun,",
]);

// The article count is hard to pick out because source names carry their own numbers - a year in a
// conference name, a volume number, a date in an SPE session title. The count column never increases
// down the list and never exceeds the cluster total, so a number too big to be the next count, or one
// sitting in a date/qualifier idiom, belongs to the name.
const parseSourceNames = ({
  region,
  totalArticles,
}: {
  region: string;
  totalArticles: number;
}) => {
  const tokens = region.split(/\s+/).filter(Boolean);
  return tokens.reduce<{ names: string[]; buffer: string[]; max: number }>(
    (acc, token, index) => {
      const value = Number.parseInt(token, 10);
      const previous = acc.buffer[acc.buffer.length - 1];
      const next = tokens[index + 1];
      const closesRow =
        isInteger(token) &&
        acc.buffer.length > 0 &&
        value <= acc.max &&
        value <= totalArticles &&
        !(previous !== undefined && NAME_QUALIFIERS.has(previous)) &&
        !(next !== undefined && WEEKDAYS.has(next));
      return closesRow
        ? {
            names: [...acc.names, acc.buffer.join(" ")],
            buffer: [],
            max: value,
          }
        : { ...acc, buffer: [...acc.buffer, token] };
    },
    { names: [], buffer: [], max: Number.POSITIVE_INFINITY },
  ).names;
};

const extractTopJournals = (text: string, totalArticles: number) => {
  const start = text.indexOf(SOURCE_HEADER);
  if (start === -1) {
    return [];
  }
  const contentStart = start + SOURCE_HEADER.length;
  const end = text.indexOf(SOURCE_END, contentStart);
  const region = text.slice(contentStart, end === -1 ? text.length : end);
  if (region.includes(NO_DATA_TEXT)) {
    return [];
  }
  return parseSourceNames({ region, totalArticles });
};

const ORG_AVG_HEADER = "Yearly citations (average) ";
const AUTHOR_ORG_SECTION = "Top author organizations";
const AUTHOR_ORG_END = "Organization types";
const INDUSTRY_ORG_SECTION = "Top industry organizations";
const INDUSTRY_ORG_END = "Top funders";

const isNumber = (token: string) => /^\d+(?:\.\d+)?$/.test(token);

// Link labels the PDF sometimes drops into a name column. Not real data, so they are removed.
const ARTIFACT_NAMES = new Set(["View further author information"]);
const withoutArtifacts = (names: string[]) =>
  names.filter((name) => !ARTIFACT_NAMES.has(name));

// Two traps make the article count hard to find. Org names can contain their own numbers - postal
// codes, house numbers, building numbers - that look just like the count. And the yearly-citations
// average can be a whole number, so it can't be told apart from the count by spotting a decimal point.
// The count column never increases down the list and never exceeds the cluster total, so a number too
// big to be the next count is part of the name.
const parseOrgNames = ({
  region,
  totalArticles,
}: {
  region: string;
  totalArticles: number;
}) => {
  const tokens = region.split(/\s+/).filter(Boolean);
  return tokens.reduce<{
    names: string[];
    buffer: string[];
    max: number;
    skip: boolean;
  }>(
    (acc, token, index) => {
      if (acc.skip) {
        return { ...acc, skip: false };
      }
      const value = Number.parseInt(token, 10);
      const next = tokens[index + 1];
      const previous = acc.buffer[acc.buffer.length - 1];
      const closesRow =
        isInteger(token) &&
        acc.buffer.length > 0 &&
        next !== undefined &&
        isNumber(next) &&
        value <= acc.max &&
        value <= totalArticles &&
        !(previous !== undefined && NAME_QUALIFIERS.has(previous));
      return closesRow
        ? {
            names: [...acc.names, acc.buffer.join(" ")],
            buffer: [],
            max: value,
            skip: true,
          }
        : { ...acc, buffer: [...acc.buffer, token] };
    },
    { names: [], buffer: [], max: Number.POSITIVE_INFINITY, skip: false },
  ).names;
};

const extractOrgNames = ({
  text,
  sectionMarker,
  endMarker,
  totalArticles,
}: {
  text: string;
  sectionMarker: string;
  endMarker: string;
  totalArticles: number;
}) => {
  const sectionStart = text.indexOf(sectionMarker);
  if (sectionStart === -1) {
    return [];
  }
  const afterMarker = sectionStart + sectionMarker.length;
  const sectionEnd = text.indexOf(endMarker, afterMarker);
  const section = text.slice(
    afterMarker,
    sectionEnd === -1 ? text.length : sectionEnd,
  );
  // An empty table prints "No data available." instead of a header and rows. The
  // header search stays within the section so it cannot fall through to the next
  // table's header and pull that table in.
  if (section.includes(NO_DATA_TEXT)) {
    return [];
  }
  const headerStart = section.indexOf(ORG_AVG_HEADER);
  if (headerStart === -1) {
    return [];
  }
  const region = section.slice(headerStart + ORG_AVG_HEADER.length);
  return withoutArtifacts(parseOrgNames({ region, totalArticles }));
};

const extractTopInstitutions = (text: string, totalArticles: number) =>
  extractOrgNames({
    text,
    sectionMarker: AUTHOR_ORG_SECTION,
    endMarker: AUTHOR_ORG_END,
    totalArticles,
  });

const extractTopCompanies = (text: string, totalArticles: number) =>
  extractOrgNames({
    text,
    sectionMarker: INDUSTRY_ORG_SECTION,
    endMarker: INDUSTRY_ORG_END,
    totalArticles,
  });

const CITING_SECTION = "Top citing clusters";
const CITED_SECTION = "Top cited clusters";
const GITHUB_SECTION = "Top GitHub repositories";

// Each connection row is "<id> <citations> <phrases>". The phrases are free text but never hold two
// adjacent bare numbers, so a number pair marks where the next row starts. The citation count never
// increases down the list, so a pair that breaks that order is a stray number inside the phrases, not
// a real row.
const CONNECTION_ROW = /(\d+)\s+(\d+)\s+.+?(?=\s+\d+\s+\d+\b|$)/g;

const parseRelatedClusters = (region: string) =>
  [...region.matchAll(CONNECTION_ROW)]
    .map((match) => ({
      id: Number.parseInt(match[1], 10),
      significantCitations: Number.parseInt(match[2], 10),
    }))
    .reduce<{
      rows: { id: number; significantCitations: number }[];
      last: number;
    }>(
      (acc, row) =>
        row.significantCitations <= acc.last
          ? { rows: [...acc.rows, row], last: row.significantCitations }
          : acc,
      { rows: [], last: Number.POSITIVE_INFINITY },
    ).rows;

const extractConnectionSection = ({
  text,
  sectionMarker,
  endMarkers,
}: {
  text: string;
  sectionMarker: string;
  endMarkers: string[];
}) => {
  const bounds = findSectionBounds({ text, sectionMarker, endMarkers });
  if (!bounds) {
    return [];
  }
  const region = text.slice(bounds.start, bounds.end);
  if (region.includes(NO_DATA_TEXT)) {
    return [];
  }
  return parseRelatedClusters(region);
};

const extractRelatedClusters = (text: string) => ({
  topCiting: extractConnectionSection({
    text,
    sectionMarker: CITING_SECTION,
    endMarkers: [CITED_SECTION],
  }),
  topCited: extractConnectionSection({
    text,
    sectionMarker: CITED_SECTION,
    endMarkers: [GITHUB_SECTION],
  }),
});

const extractCoreArticles = createSectionExtractor({
  sectionMarker: SECTION_MARKERS.core,
  endMarkers: [SECTION_MARKERS.review],
});

const extractReviewArticles = createSectionExtractor({
  sectionMarker: SECTION_MARKERS.review,
  endMarkers: [SECTION_MARKERS.highlyCited],
});

const extractHighlyCitedArticles = createSectionExtractor({
  sectionMarker: SECTION_MARKERS.highlyCited,
  endMarkers: [SECTION_MARKERS.topSources],
});

export const parseClusterPdf = async (data: Uint8Array) => {
  const { text, doiLinks } = await extractClusterDocument(data);
  const resolveDoi = createDoiResolver(doiLinks);
  const totalArticles = extractTotalArticles(text);

  return {
    id: extractClusterId(text),
    totalArticles,
    averageArticleAgeYears: extractAverageArticleAgeYears(text),
    citationRatingPercentile: extractCitationRatingPercentile(text),
    patentRatingPercentile: extractPatentRatingPercentile(text),
    topJournals: extractTopJournals(text, totalArticles),
    topInstitutions: extractTopInstitutions(text, totalArticles),
    topCompanies: extractTopCompanies(text, totalArticles),
    relatedClusters: extractRelatedClusters(text),
    articles: {
      core: resolveArticleDois(extractCoreArticles(text), resolveDoi),
      review: resolveArticleDois(extractReviewArticles(text), resolveDoi),
      highlyCited: resolveArticleDois(
        extractHighlyCitedArticles(text),
        resolveDoi,
      ),
    },
  };
};
