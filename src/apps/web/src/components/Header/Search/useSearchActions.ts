import { useNavigate } from "@tanstack/react-router";

export const useSearchActions = () => {
  const navigate = useNavigate({ from: "/" });

  const commit = (text: string) => {
    void navigate({
      search: (prev) => ({ ...prev, q: text || undefined }),
    });
  };

  const clear = () => {
    void navigate({
      search: (prev) => ({ ...prev, q: undefined }),
      replace: true,
    });
  };

  const setMinScore = (value: number) => {
    void navigate({
      search: (prev) => ({ ...prev, minScore: value }),
      replace: true,
    });
  };

  return { commit, clear, setMinScore };
};
