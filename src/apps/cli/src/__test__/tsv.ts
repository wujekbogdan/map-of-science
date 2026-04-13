export const toTsv = (rows: (string | number)[][]) =>
  rows.map((row) => row.join("\t")).join("\n") + "\n";
