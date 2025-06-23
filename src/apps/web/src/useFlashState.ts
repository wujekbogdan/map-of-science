import { useEffect, useState } from "react";

export const useFlashState = (trigger: boolean) => {
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setToggle(false);
      return;
    }

    setToggle(true);
    const timeout = setTimeout(() => {
      setToggle(false);
    }, 1_500);

    return () => {
      clearTimeout(timeout);
    };
  }, [trigger]);

  return toggle;
};
