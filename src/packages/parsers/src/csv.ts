import { parse as csvParse } from "csv-parse/browser/esm";

type CsvSource = string | Buffer;
type Provider = () => Promise<CsvSource> | CsvSource;
type OnItem<Item, Result> = (item: Item) => Result;
type CsvRecord = Record<string, string>;

export const parseCsv = async <Item extends CsvRecord, Result>(
  provider: Provider,
  onItem: OnItem<Item, Result>,
): Promise<void> => {
  const csv = await provider();

  return new Promise((resolve, reject) => {
    const parser = csvParse({
      delimiter: "\t",
      columns: true,
      bom: true,
      quote: "",
    });

    const onReadable = () => {
      const record = parser.read() as Item | null;

      if (record === null) {
        return;
      }

      onItem(record);
      onReadable();
    };

    const stream = parser
      .on("error", reject)
      .on("readable", onReadable)
      .on("end", resolve);

    stream.write(csv);
    stream.end();
  });
};

const httpProvider = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV from: ${url}`);
  }
  return response.text();
};

export const withHttpProvider = async <Item extends CsvRecord, Result>(
  url: string,
  onItem: OnItem<Item, Result>,
) => parseCsv(() => httpProvider(url), onItem);
