import { extractText as unpdfExtractText, getDocumentProxy } from "unpdf";

export const extractText = async (data: Uint8Array) => {
  const pdf = await getDocumentProxy(new Uint8Array(data));
  const { text } = await unpdfExtractText(pdf, { mergePages: true });
  return text;
};
