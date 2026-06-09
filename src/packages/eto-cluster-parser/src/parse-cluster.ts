import { z } from "zod";

const paperStatsSchema = z.object({
  title: z.string(),
  year: z.coerce.string(),
  times_cited: z.coerce.number(),
  doi: z.string().nullish(),
  is_core: z.boolean().default(false),
  is_review: z.boolean().default(false),
  is_most_cited: z.boolean().default(false),
  core_rank: z.coerce.number().nullish(),
  review_rank: z.coerce.number().nullish(),
  citation_rank: z.coerce.number().nullish(),
});

type PaperStats = z.infer<typeof paperStatsSchema>;

const sourceSchema = z.object({ source_title: z.string() });
const authorOrgSchema = z.object({
  affiliation: z.object({ affiliation: z.string() }),
});
const industryOrgSchema = z.object({
  industry_affiliation: z.object({ industry_affiliation: z.string() }),
});

const citingSchema = z.object({
  importer: z.coerce.number(),
  num_imports: z.coerce.number(),
});
const citedSchema = z.object({
  exporter: z.coerce.number(),
  num_exports: z.coerce.number(),
});

const clusterSchema = z.object({
  cluster_id: z.coerce.number(),
  NP: z.coerce.number(),
  age: z.coerce.number(),
  citation_percentile: z.coerce.number(),
  n_patents_percentile: z.coerce.number(),
  paper_stats: z.array(z.unknown()).default([]),
  source_info: z.array(z.unknown()).default([]),
  author_orgs: z
    .object({ author_org_info: z.array(z.unknown()).default([]) })
    .default({ author_org_info: [] }),
  industry_org_info: z.array(z.unknown()).default([]),
  importing_cluster_counts: z.array(z.unknown()).default([]),
  exporting_cluster_counts: z.array(z.unknown()).default([]),
});

// The source and organization lists arrive already ranked, so the leading
// entries are the most relevant.
const TOP_LIST_SIZE = 10;

// A malformed individual entry is dropped rather than failing the whole record.
const parsePapers = (entries: unknown[]) =>
  entries
    .map((entry) => paperStatsSchema.safeParse(entry))
    .flatMap((result) => (result.success ? [result.data] : []));

const topNames = <T>(
  entries: unknown[],
  schema: z.ZodType<T>,
  pick: (entry: T) => string,
) =>
  entries
    .map((entry) => schema.safeParse(entry))
    .flatMap((result) => (result.success ? [pick(result.data)] : []))
    .slice(0, TOP_LIST_SIZE);

// Every connection entry is kept, in the record's given order.
const relatedClusters = <T>(
  entries: unknown[],
  schema: z.ZodType<T>,
  toRelated: (entry: T) => { id: number; significantCitations: number },
) =>
  entries
    .map((entry) => schema.safeParse(entry))
    .flatMap((result) => (result.success ? [toRelated(result.data)] : []));

// The ETO `title` packs the real title, year, and source into one string as
// "Real Title, YYYY, Source". The year is the reliable anchor: split on its LAST
// occurrence so a title carrying its own commas or earlier years stays intact.
// Whitespace is collapsed but the trailing space is preserved, because an article
// with no source reads "Real Title, YYYY, " and the anchor depends on that space.
const splitTitleAndMetadata = ({
  title,
  year,
}: {
  title: string;
  year: string;
}) => {
  const collapsed = title.replace(/\s+/g, " ");
  const anchor = `, ${year}, `;
  const anchorAt = collapsed.lastIndexOf(anchor);
  if (anchorAt === -1) {
    return { title: collapsed.trim(), metadata: year };
  }
  const source = collapsed.slice(anchorAt + anchor.length).trim();
  return {
    title: collapsed.slice(0, anchorAt).trim(),
    metadata: source.length > 0 ? `${year}: ${source}` : year,
  };
};

const toArticleEntry = (paper: PaperStats) => ({
  ...splitTitleAndMetadata({ title: paper.title, year: paper.year }),
  citations: paper.times_cited,
  doi: paper.doi ?? null,
});

// An article may carry several flags, so it can appear in more than one section.
const buildSection = ({
  papers,
  isIncluded,
  rankOf,
}: {
  papers: PaperStats[];
  isIncluded: (paper: PaperStats) => boolean;
  rankOf: (paper: PaperStats) => number;
}) =>
  papers
    .filter(isIncluded)
    .sort((left, right) => rankOf(left) - rankOf(right))
    .map(toArticleEntry)
    // A missing title (the split produced no head) is a source-data quirk - drop it
    // rather than emitting a titleless entry.
    .filter((entry) => entry.title.length > 0);

export const parseCluster = (record: unknown) => {
  const data = clusterSchema.parse(record);
  const papers = parsePapers(data.paper_stats);

  return {
    id: data.cluster_id,
    totalArticles: data.NP,
    averageArticleAgeYears: data.age,
    citationRatingPercentile: data.citation_percentile,
    patentRatingPercentile: data.n_patents_percentile,
    topJournals: topNames(
      data.source_info,
      sourceSchema,
      (source) => source.source_title,
    ),
    topInstitutions: topNames(
      data.author_orgs.author_org_info,
      authorOrgSchema,
      (org) => org.affiliation.affiliation,
    ),
    topCompanies: topNames(
      data.industry_org_info,
      industryOrgSchema,
      (org) => org.industry_affiliation.industry_affiliation,
    ),
    articles: {
      core: buildSection({
        papers,
        isIncluded: (paper) => paper.is_core,
        rankOf: (paper) => paper.core_rank ?? 0,
      }),
      review: buildSection({
        papers,
        isIncluded: (paper) => paper.is_review,
        rankOf: (paper) => paper.review_rank ?? 0,
      }),
      highlyCited: buildSection({
        papers,
        isIncluded: (paper) => paper.is_most_cited,
        rankOf: (paper) => paper.citation_rank ?? 0,
      }),
    },
    relatedClusters: {
      topCiting: relatedClusters(
        data.importing_cluster_counts,
        citingSchema,
        (entry) => ({
          id: entry.importer,
          significantCitations: entry.num_imports,
        }),
      ),
      topCited: relatedClusters(
        data.exporting_cluster_counts,
        citedSchema,
        (entry) => ({
          id: entry.exporter,
          significantCitations: entry.num_exports,
        }),
      ),
    },
  };
};
