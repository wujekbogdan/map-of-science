import { useEffect, useRef, useState } from "react";

/**
 * Gates a hover `candidate` behind a dwell window so quick passes over a target
 * are ignored.
 *
 * A non-null `candidate` is held back until it stays unchanged for `delayMs`,
 * then becomes the committed value. A null `candidate` commits immediately,
 * so leaving a target is never delayed. Switching directly between two
 * non-null `candidate`s first clears to null and then dwells on the new one,
 * which guarantees the consumer sees an explicit exit between targets
 * instead of a snap from one to the next.
 *
 * Equality is referential: re-renders with the same `candidate` reference do
 * not restart the dwell.
 */
export const useHoverIntent = <T>(
  candidate: T | null,
  delayMs: number,
): T | null => {
  const [committed, setCommitted] = useState<T | null>(candidate);
  const previous = useRef(candidate);

  useEffect(() => {
    if (candidate === previous.current) return;
    previous.current = candidate;

    if (candidate === null) {
      setCommitted(null);
      return;
    }

    setCommitted(null);
    const timer = setTimeout(() => {
      setCommitted(candidate);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [candidate, delayMs]);

  return committed;
};
