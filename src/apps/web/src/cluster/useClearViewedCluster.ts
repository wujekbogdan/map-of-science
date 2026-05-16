import { useNavigate } from "@tanstack/react-router";

export const useClearViewedCluster = () => {
  const navigate = useNavigate();
  return () =>
    navigate({
      to: "/",
      search: (prev) => prev,
    });
};
