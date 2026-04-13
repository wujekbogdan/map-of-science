type Options = {
  start: number;
  limit: number;
};

type State = {
  index: number;
  processed: number;
};

const processNext = async <T>(
  generator: AsyncGenerator<T>,
  options: Options,
  onEntry: (entry: T, position: number) => Promise<void> | void,
  state: State,
): Promise<number> => {
  if (state.processed >= options.limit) {
    return state.processed;
  }

  const result = await generator.next();

  if (result.done || !result.value) {
    return state.processed;
  }

  if (state.index < options.start) {
    return processNext(generator, options, onEntry, {
      index: state.index + 1,
      processed: state.processed,
    });
  }

  await onEntry(result.value, options.start + state.processed + 1);

  return processNext(generator, options, onEntry, {
    index: state.index + 1,
    processed: state.processed + 1,
  });
};

export const forEachEntry = <T>(
  generator: AsyncGenerator<T>,
  options: Options,
  onEntry: (entry: T, position: number) => Promise<void> | void,
) => processNext(generator, options, onEntry, { index: 0, processed: 0 });
