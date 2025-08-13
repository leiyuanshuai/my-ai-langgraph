import {useRef, useState} from "react";

export function useLoadingState() {

  const loadingCount = useRef(0);

  const [ids, setIds] = useState([] as number[]);

  function loading() {
    const currentCount = loadingCount.current++;
    setIds([...ids, currentCount]);
    return () => {
      setIds(ids => {
        ids = [...ids];
        const index = ids.indexOf(currentCount);
        index > -1 && ids.splice(index, 1);
        return ids;
      });
    };
  }

  const isLoading = ids.length > 0;

  return { loading, isLoading };
}
