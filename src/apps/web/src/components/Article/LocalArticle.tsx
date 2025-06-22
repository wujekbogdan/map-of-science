import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { YoutubeVideo } from "../../api/model";
import { config } from "../../config.ts";

type Props = {
  html: string | null;
  videos: YoutubeVideo[];
};

const youtubeIdToImage = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat(config.LANG).format(new Date(date));
};

export const LocalArticle = ({ html, videos }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      {
        // It says dangerouslySetInnerHTML, but it's safe because the content comes
        // from local markdown files we control.
      }
      {html && <Article dangerouslySetInnerHTML={{ __html: html }} />}
      <Videos>
        {videos.length > 0 ? (
          <>
            <ListHeader>{t("article.youtubeRelated")}</ListHeader>
            <List>
              {videos.map((video) => (
                <ListItem key={video.videoId}>
                  <Link
                    href={video.segmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <VideoHeader>{video.segmentName} </VideoHeader>
                    <VideoDate>{formatDate(video.date)}</VideoDate>
                    <Thumbnail
                      src={youtubeIdToImage(video.videoId)}
                      alt={video.segmentName}
                    />
                  </Link>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <ListHeader>{t("article.youtubeNone")}</ListHeader>
        )}
      </Videos>
    </>
  );
};

const Videos = styled.div`
  margin: 48px 0 0 0;

  &:first-child {
    margin: 0;
  }
`;

const ListHeader = styled.h2``;

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

// TODO: Implement proper styling for Markdown content.
// https://github.com/wujekbogdan/map-of-science/issues/58
const Article = styled.div`
  line-height: 1.42;
`;
