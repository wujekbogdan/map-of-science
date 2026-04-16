import { Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useSWR from "swr";
import { useShallow } from "zustand/react/shallow";
import { loadData } from "../api/worker.ts";
import { config } from "../config.ts";
import { useMapStore } from "../map/mapStore.ts";
import { useWindowSize } from "../useWindowSize.ts";
import { Article } from "./Article/Article.tsx";
import { DevTool } from "./DevTool.tsx";
import { Header } from "./Header/Header.tsx";
import Info from "./Info/Info.tsx";
import Logo from "./Logo/Logo.tsx";
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
  const [setMapSize, setYoutubeVideos] = useMapStore(
    useShallow((s) => [s.setMapSize, s.setYoutubeVideos]),
  );
  const { isLoading } = useSWR("data", () => loadData(), {
    onSuccess: ({ youtube }) => {
      setYoutubeVideos(youtube);
    },
    onError: (err) => {
      console.error("Error loading data:", err);
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

        <InfoWrapper>
          <Info />
        </InfoWrapper>

        <LogoWrapper>
          <Logo />
        </LogoWrapper>

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

const InfoWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
`;

const LogoWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
`;

const DevToolsWrapper = styled.div`
  z-index: 20;
  position: fixed;
  bottom: 0;
  left: 0;
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
