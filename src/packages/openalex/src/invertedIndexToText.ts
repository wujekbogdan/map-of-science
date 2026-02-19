export const invertedIndexToText = (index: Record<string, number[]>) =>
  Object.entries(index)
    .flatMap(([word, positions]) =>
      positions.map((pos) => [pos, word] as const),
    )
    .sort(([a], [b]) => a - b)
    .map(([, word]) => word)
    .join(" ");
