import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { config } from "../config.ts";
import { useMapStore } from "../map/mapStore.ts";
import { MapView, type MapViewConfig } from "../map/view/MapView.tsx";
import { createD3ZoomDriver } from "../map/view/createD3ZoomDriver.ts";
import { createDebouncer } from "../map/view/debouncer.ts";
import { useWindowSize } from "../useWindowSize.ts";
import { Article } from "./Article/Article.tsx";
import { DevTool } from "./DevTool.tsx";
import { Header } from "./Header/Header.tsx";
import Info from "./Info/Info.tsx";
import Logo from "./Logo/Logo.tsx";
import Map from "./Map/Map.tsx";

const VIEW_CONFIG: MapViewConfig<SVGSVGElement> = {
  scaleExtent: { min: 0.5, max: 100 },
  debounceMs: 150,
  initial: { x: 0, y: 0, scale: 1 },
  defaults: { animate: true, padding: 0.1 },
  createDriver: createD3ZoomDriver,
  createDebouncer,
};

const fetchMapSvg = async () => {
  // Resolve the asset URL, then ensure the bytes are decoded before reporting
  // ready, so the controller can sync background size on first paint.
  const url = (await import("./Map/map.svg")).default;
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = reject;
  });
};

const AppLoader = () => {
  // TODO: Implement global loading state
  return "";
};

function App() {
  const [svgScaleFactor, svgOffset] = useMapStore(
    useShallow((s) => [s.temp__svgScaleFactor, s.temp__svgOffset]),
  );
  const size = useWindowSize();
  const { data: mapSvgUrl } = useQuery({
    queryKey: ["map-svg"],
    queryFn: fetchMapSvg,
    staleTime: Infinity,
  });

  return (
    <Container>
      <Suspense fallback={<AppLoader />}>
        <MapView
          config={VIEW_CONFIG}
          size={size}
          background={{
            imageUrl: mapSvgUrl,
            scaleFactor: svgScaleFactor,
            offset: svgOffset,
          }}
          chrome={
            <>
              <Header />
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
            </>
          }
        >
          <Map />
        </MapView>
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
`;

export default App;
