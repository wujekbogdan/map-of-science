import debounce from "lodash/debounce";
import { useEffect, useState } from "react";

export const useWindowSize = () => {
  const measure = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [size, setSize] = useState(measure());

  useEffect(() => {
    const onResizeHandler = debounce(() => {
      setSize(measure());
    }, 100);

    window.addEventListener("resize", onResizeHandler);

    return () => {
      onResizeHandler.cancel();
      window.removeEventListener("resize", onResizeHandler);
    };
  }, []);

  return size;
};
