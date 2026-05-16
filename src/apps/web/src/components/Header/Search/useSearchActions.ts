import { useNavigate } from "@tanstack/react-router";

export const useSearchActions = () => {
  const navigate = useNavigate();

  // `q` and the filter params belong to the root route, so they are shared by
  // every child route. `to: "."` keeps each action on the active route and
  // changes only search params; a concrete path would redirect there, closing
  // an open cluster.
  const commit = (text: string) => {
    void navigate({
      to: ".",
      search: (prev) => ({ ...prev, q: text || undefined }),
    });
  };

  const clear = () => {
    void navigate({
      to: ".",
      search: (prev) => ({ ...prev, q: undefined }),
      replace: true,
    });
  };

  const setMinScore = (value: number | undefined) => {
    void navigate({
      to: ".",
      search: (prev) => ({ ...prev, minScore: value }),
      replace: true,
    });
  };

  return { commit, clear, setMinScore };
};
