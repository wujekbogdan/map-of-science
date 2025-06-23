import { useEffect, useState } from "react";

export const useFlashState = (triggerValue: unknown) => {
  const [state, setState] = useState(false);

  useEffect(() => {
    setState(true);
    const timeout = setTimeout(() => setState(false), 2000);
    return () => clearTimeout(timeout);
  }, [triggerValue]);

  return state;
};
