import { useEffect, useRef } from "react";

export const useInitialMount = () => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return isInitialMount.current;
};
