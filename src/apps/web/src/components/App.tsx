import { Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useSWR from "swr";
import { useShallow } from "zustand/react/shallow";
import { loadData } from "../api/worker.ts";
import { config } from "../config.ts";
import { useStore } from "../store.ts";
import { useLanguage } from "../useLanguage.ts";
import { useWindowSize } from "../useWindowSize.ts";
import { Article } from "./Article/Article.tsx";
import { DevTool } from "./DevTool.tsx";
import { Header } from "./Header/Header.tsx";
import MapComponent from "./Map/Map.tsx";

const AppLoader = () => {
  // TODO: Implement global loading state
  return "";
};

const MapLoader = () => {
  const { t } = useTranslation();
  return <LoadingWrapper>{t("map.loading")}&hellip;</LoadingWrapper>;
};

function App() {
  const language = useLanguage();
  const [setMapSize, setDataPoints, setConcepts, setYoutubeVideos, setAreas] =
    useStore(
      useShallow((s) => [
        s.setMapSize,
        s.setDataPoints,
        s.setConcepts,
        s.setYoutubeVideos,
        s.setAreas,
      ]),
    );
  const { isLoading } = useSWR(["data", language], () => loadData(language), {
    onSuccess: ({ dataPoints, concepts, youtube, areas }) => {
      setDataPoints(dataPoints);
      setConcepts(concepts);
      setYoutubeVideos(youtube);
      setAreas(areas);
    },
  });

  const size = useWindowSize(
    useCallback(
      (size: { width: number; height: number }) => {
        setMapSize(size);
      },
      [setMapSize],
    ),
  );
  return (
    <Container>
      <Suspense fallback={<AppLoader />}>
        <Header />
        {isLoading ? <MapLoader /> : <MapComponent size={size} />}
        <Article />

        {config.devTool && (
          <DevToolsWrapper>
            <DevTool />
          </DevToolsWrapper>
        )}
      </Suspense>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: radial-gradient(
    circle,
    rgba(173, 216, 230, 0.7) 0,
    rgba(173, 216, 230, 1) 100%
  );
`;

const DevToolsWrapper = styled.div`
  z-index: 20;
  position: fixed;
  bottom: 0;
  right: 0;
  max-height: 100vh;
  overflow-y: auto;
`;

const LoadingWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export default App;
