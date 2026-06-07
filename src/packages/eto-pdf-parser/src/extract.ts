import { extractText as unpdfExtractText, getDocumentProxy } from "unpdf";

type TextItem = { str: string; transform: number[] };

const DOI_HOST = "doi.org";
const DOI_URL_PREFIX = /^https?:\/\/(?:dx\.)?doi\.org\//i;

// The annotation URL carries the resolver prefix (occasionally doubled in malformed
// source data); strip it down to the bare DOI.
const toBareDoi = (url: string): string => {
  const value = url.trim();
  return DOI_URL_PREFIX.test(value)
    ? toBareDoi(value.replace(DOI_URL_PREFIX, ""))
    : value;
};

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "number");

const annotationUrl = (annotation: object) => {
  if ("url" in annotation && typeof annotation.url === "string") {
    return annotation.url;
  }
  if ("unsafeUrl" in annotation && typeof annotation.unsafeUrl === "string") {
    return annotation.unsafeUrl;
  }
  return null;
};

// pdfjs types annotations loosely (any), so the shape is validated here: a DOI link is a
// "Link" annotation whose URL points at doi.org, carrying the rectangle it occupies.
const toDoiAnnotation = (annotation: unknown) => {
  if (typeof annotation !== "object" || annotation === null) {
    return null;
  }
  if (!("subtype" in annotation) || annotation.subtype !== "Link") {
    return null;
  }
  const url = annotationUrl(annotation);
  if (!url?.includes(DOI_HOST)) {
    return null;
  }
  if (!("rect" in annotation) || !isNumberArray(annotation.rect)) {
    return null;
  }
  return { doi: toBareDoi(url), rect: annotation.rect };
};

// Rebuilds the title a hyperlink points at. A Link annotation knows only its own
// rectangle on the page, never the text beneath it, so the title is recovered from the
// text-layer glyphs whose position falls inside that rectangle. The rectangle is
// [left, bottom, right, top] in PDF points; the slop absorbs glyph/edge rounding.
const titleUnderRectangle = (items: TextItem[], rectangle: number[]) => {
  const [left, bottom, right, top] = rectangle;
  return items
    .filter((item) => {
      const x = item.transform[4];
      const y = item.transform[5];
      return x >= left - 2 && x <= right + 2 && y >= bottom - 2 && y <= top + 2;
    })
    .map((item) => item.str)
    .join("");
};

// A DOI in these PDFs is a hyperlink, and a PDF hyperlink does not live in the text. Each
// page has two independent layers: the text layer (the glyphs you read) and the annotation
// layer (interactive overlays). A linked title is text in the first layer with a "Link"
// annotation - a rectangle plus a URL - sitting on top of it in the second. The layers
// never reference each other; nothing in the structure says which title a URL belongs to.
// Only their position ties them together. So each DOI link is reconstructed by reading the
// annotation's URL and rebuilding its title from the glyphs inside the annotation rectangle.
const reconstructDoiLinksOnPage = async (
  pdf: Awaited<ReturnType<typeof getDocumentProxy>>,
  pageNumber: number,
) => {
  const page = await pdf.getPage(pageNumber);
  const doiAnnotations = (await page.getAnnotations()).flatMap(
    (annotation: unknown) => {
      const doiAnnotation = toDoiAnnotation(annotation);
      return doiAnnotation ? [doiAnnotation] : [];
    },
  );
  if (doiAnnotations.length === 0) {
    return [];
  }

  const items = (await page.getTextContent()).items.flatMap((item) =>
    "str" in item ? [{ str: item.str, transform: item.transform }] : [],
  );
  return doiAnnotations.map(({ doi, rect }) => ({
    doi,
    title: titleUnderRectangle(items, rect),
  }));
};

const reconstructDoiLinks = async (
  pdf: Awaited<ReturnType<typeof getDocumentProxy>>,
) => {
  const pageNumbers = Array.from(
    { length: pdf.numPages },
    (_, index) => index + 1,
  );
  const links = (
    await Promise.all(
      pageNumbers.map((page) => reconstructDoiLinksOnPage(pdf, page)),
    )
  ).flat();

  // One title can span several lines, producing several annotations under one DOI; join
  // their recovered text back into a single title per DOI.
  return [...new Set(links.map((link) => link.doi))].map((doi) => ({
    doi,
    title: links
      .filter((link) => link.doi === doi)
      .map((link) => link.title)
      .join(""),
  }));
};

export const extractClusterDocument = async (data: Uint8Array) => {
  const pdf = await getDocumentProxy(new Uint8Array(data));
  const { text } = await unpdfExtractText(pdf, { mergePages: true });
  const doiLinks = await reconstructDoiLinks(pdf);
  return { text, doiLinks };
};
