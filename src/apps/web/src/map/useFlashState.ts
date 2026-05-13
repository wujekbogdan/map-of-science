import { useEffect, useRef, useState } from "react";

type Options = {
  /** The value whose change drives the flash. */
  trigger: unknown;
  /** Evaluated at the moment `trigger` changes; when `false`, that change is ignored. Defaults to `true`. */
  shouldFlash?: boolean;
};

/**
 * Returns `true` for a brief window after `trigger` changes, then returns to `false`.
 */
export const useFlashState = ({ trigger, shouldFlash = true }: Options) => {
  const shouldFlashRef = useRef(shouldFlash);
  shouldFlashRef.current = shouldFlash;
  const [state, setState] = useState(false);

  useEffect(() => {
    if (!shouldFlashRef.current) return;
    setState(true);
    const timeout = setTimeout(() => setState(false), 2000);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return state;
};
