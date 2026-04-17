import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "../../api-client/index.ts";
import { ArticleWithVideos } from "./ArticleWithVideos.tsx";

type Props = {
  html: string | null;
  areaId: string;
};

export const ArticleForArea = ({ html, areaId }: Props) => {
  const trpc = useTRPC();
  const { data: items = [] } = useQuery(
    trpc.content.byArea.queryOptions({ areaId }),
  );
  return <ArticleWithVideos html={html} items={items} />;
};
