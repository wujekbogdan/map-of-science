import { useTranslation } from "react-i18next";
import styled from "styled-components";
import type { RouterOutputs } from "../../api-client/index.ts";
import HtmlArticle from "./HtmlArticle.tsx";

type AreaContentItem = RouterOutputs["content"]["byArea"][number];

type Props = {
  html: string | null;
  items: AreaContentItem[];
};

const youtubeIdToImage = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

export const ArticleWithVideos = ({ html, items }: Props) => {
  const { t, i18n } = useTranslation();
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(i18n.language).format(new Date(date));

  return (
    <>
      {html && <HtmlArticle html={html} />}
      {items.length > 0 ? (
        <List>
          {items.map((item) => (
            <ListItem key={item.id}>
              <Link
                href={item.metadata.segmentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <VideoHeader>{item.metadata.segmentName} </VideoHeader>
                <VideoDate>{formatDate(item.metadata.date)}</VideoDate>
                <Thumbnail
                  src={youtubeIdToImage(item.metadata.videoId)}
                  alt={item.metadata.segmentName}
                />
              </Link>
            </ListItem>
          ))}
        </List>
      ) : (
        <EmptyMessage>{t("article.youtubeNone")}</EmptyMessage>
      )}
    </>
  );
};

const EmptyMessage = styled.p``;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  margin: 0 0 36px 0;

  &:last-child {
    margin: 0;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const Link = styled.a`
  display: block;
  text-decoration: none;
`;

const VideoHeader = styled.h3`
  color: #9b5b9b;
  margin-bottom: 0;
`;

const VideoDate = styled.span`
  font-size: 10px;
  color: #666;
`;

const Thumbnail = styled.img`
  margin-top: 12px;
  display: block;
  border-radius: 3px;
  border: 1px solid #eee;
`;
