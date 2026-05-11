import { rootRouteId, useSearch } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { useMapStore, RGB } from "../map/mapStore.ts";
import { useMapViewScale } from "../map/view/hooks.ts";
import { parseMinScore } from "./Header/Search/Dropdown/Filters/minScore/filter.ts";
import { useSearchActions } from "./Header/Search/useSearchActions.ts";

const i18n = (str: string) => str;

const hexToRgb = (hex: string) => {
  hex = hex
    .replace(/^#/, "")
    .split("")
    .map((x) => x + x)
    .join("");
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const rgbToHex = (color: RGB) => {
  const { r, g, b } = color;
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        return x.toString(16).padStart(2, "0");
      })
      .join("")
  );
};

export const DevTool = () => {
  const [visibility, setVisibility] = useState<"collapsed" | "expanded">(
    "collapsed",
  );
  const isExpanded = visibility === "expanded";
  const zoom = useMapViewScale().toFixed(2);
  const params = useSearch({ from: rootRouteId });
  const searchMinScore = parseMinScore(params);
  const { setMinScore } = useSearchActions();
  const [
    fontSize,
    setFontSize,
    scaleFactor,
    setScaleFactor,
    zoomStepFactor,
    setZoomStepFactor,
    maxDataPointsInViewport,
    setMaxDataPointsInViewport,
    maxLabelsInViewport,
    setMaxLabelsInViewport,
    svgScaleFactor,
    svgOffset,
    setSvgOffset,
    setSvgScaleFactor,
    growthRatingColors,
    setGrowthRatingColors,
    clusterLevelArticleThreshold,
    setClusterLevelArticleThreshold,
    clusterLabelMinZoom,
    setClusterLabelMinZoom,
    clusterLabelFontSize,
    setClusterLabelFontSize,
  ] = useMapStore(
    useShallow((state) => [
      state.fontSize,
      state.setFontSize,
      state.scaleFactor,
      state.setScaleFactor,
      state.zoomStepFactor,
      state.setZoomStepFactor,
      state.maxDataPointsInViewport,
      state.setMaxDataPointsInViewport,
      state.maxLabelsInViewport,
      state.setMaxLabelsInViewport,
      state.temp__svgScaleFactor,
      state.temp__svgOffset,
      state.temp__setSvgOffset,
      state.temp__setSvgScaleFactor,
      state.growthRatingColors,
      state.setGrowthRatingColors,
      state.clusterLevelArticleThreshold,
      state.setClusterLevelArticleThreshold,
      state.clusterLabelMinZoom,
      state.setClusterLabelMinZoom,
      state.clusterLabelFontSize,
      state.setClusterLabelFontSize,
    ]),
  );
  const areaLayers = [
    { key: "layer1", label: "Area: tier 1" },
    { key: "layer2", label: "Area: tier 2" },
    { key: "layer3", label: "Area: tier 3" },
  ] as const;
  const clusterLevels = [1, 2, 3, 4, 5, 6] as const;
  const scaleFactors = ["min", "max", "zoom"] as const;

  const collapse = () => {
    setVisibility("collapsed");
  };
  const onToggleClick = () => {
    setVisibility(isExpanded ? "collapsed" : "expanded");
  };

  const colorInputValues = {
    start: rgbToHex(growthRatingColors.start),
    middle: rgbToHex(growthRatingColors.middle),
    end: rgbToHex(growthRatingColors.end),
  };

  const setGrowthRatingColor = (
    color: keyof typeof colorInputValues,
    value: string,
  ) => {
    try {
      const rgb = hexToRgb(value);
      setGrowthRatingColors({
        ...growthRatingColors,
        [color]: rgb,
      });
    } catch (error) {
      console.error("Invalid color value:", value, error);
    }
  };

  return (
    <>
      {isExpanded && <Backdrop onClick={collapse} />}
      <Form>
        {isExpanded && (
          <ScrollArea>
            <Panels>
              <Panel>
                <Header>{i18n("Data")}</Header>
                <Section>
                  <FormControl>
                    <Label>{i18n("Visible data points limit")}</Label>
                    <Input
                      type="number"
                      value={maxDataPointsInViewport}
                      onChange={(e) => {
                        setMaxDataPointsInViewport(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                </Section>
                <Section>
                  <FormControl>
                    <Label>{i18n("Visible cluster labels limit")}</Label>
                    <Input
                      type="number"
                      value={maxLabelsInViewport}
                      onChange={(e) => {
                        setMaxLabelsInViewport(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                </Section>
                <Section>
                  <FormControl>
                    <Label>{i18n("Search min score (0-1)")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={searchMinScore}
                      onChange={(e) => {
                        setMinScore(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                </Section>
                <Section>
                  <Label>{i18n("Current Zoom")}</Label>
                  <span>{zoom}</span>
                </Section>
              </Panel>

              <Panel>
                <Header>{i18n("Zoom")}</Header>
                <Section>
                  <FormControl>
                    <Label>{i18n("Zoom scale factor")}</Label>
                    <Input
                      type="number"
                      value={zoomStepFactor}
                      onChange={(e) => {
                        setZoomStepFactor(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                </Section>
                <Section>
                  <Label>{i18n("Current Zoom")}</Label>
                  <span>{zoom}</span>
                </Section>
              </Panel>

              <Panel>
                <Header>{i18n("SVG")}</Header>
                <Section>
                  <FormControl>
                    <Label>{i18n("SVG scale factor")}</Label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      value={svgScaleFactor}
                      onChange={(e) => {
                        setSvgScaleFactor(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                </Section>
                <Section>
                  <FormControl>
                    <Label>{i18n("SVG offset X")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="-1000"
                      max="1000"
                      value={svgOffset.x}
                      onChange={(e) => {
                        setSvgOffset({
                          ...svgOffset,
                          x: Number(e.target.value),
                        });
                      }}
                    />
                  </FormControl>
                </Section>
                <Section>
                  <FormControl>
                    <Label>{i18n("SVG offset Y")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="-1000"
                      max="1000"
                      value={svgOffset.y}
                      onChange={(e) => {
                        setSvgOffset({
                          ...svgOffset,
                          y: Number(e.target.value),
                        });
                      }}
                    />
                  </FormControl>
                </Section>
              </Panel>

              <Panel>
                <Header>{i18n("Area label sizes")}</Header>
                {areaLayers.map(({ key, label }) => (
                  <Section key={key}>
                    <FormControl>
                      <Label>{i18n(label)}</Label>
                      <Input
                        type="number"
                        value={fontSize[key]}
                        onChange={(e) => {
                          setFontSize(key, e.target.value);
                        }}
                      />
                    </FormControl>
                  </Section>
                ))}
              </Panel>

              <Panel>
                <Header>{i18n("Scale Factor")}</Header>
                {scaleFactors.map((factor) => (
                  <Section key={factor}>
                    <FormControl>
                      <Label>{factor}</Label>
                      <Input
                        type="number"
                        value={scaleFactor[factor]}
                        onChange={(e) => {
                          setScaleFactor(factor, e.target.value);
                        }}
                      />
                    </FormControl>
                  </Section>
                ))}
              </Panel>

              <Panel>
                <Header>{i18n("Clusters")}</Header>
                <Section>
                  <Label>{i18n("Per-level config")}</Label>
                  <Grid>
                    <GridHead>{i18n("Level")}</GridHead>
                    <GridHead>{i18n("Min articles")}</GridHead>
                    <GridHead>{i18n("Min zoom")}</GridHead>
                    <GridHead>{i18n("Font size")}</GridHead>
                    {clusterLevels.map((level) => (
                      <Fragment key={level}>
                        <GridCell>{level}</GridCell>
                        <GridCell>
                          {level === 6 ? (
                            <Muted>{i18n("(floor)")}</Muted>
                          ) : (
                            <CompactInput
                              type="number"
                              value={clusterLevelArticleThreshold[level]}
                              onChange={(e) => {
                                setClusterLevelArticleThreshold(
                                  level,
                                  e.target.value,
                                );
                              }}
                            />
                          )}
                        </GridCell>
                        <GridCell>
                          <CompactInput
                            type="number"
                            step="0.1"
                            value={clusterLabelMinZoom[level]}
                            onChange={(e) => {
                              setClusterLabelMinZoom(level, e.target.value);
                            }}
                          />
                        </GridCell>
                        <GridCell>
                          <CompactInput
                            type="number"
                            step="0.5"
                            value={clusterLabelFontSize[level]}
                            onChange={(e) => {
                              setClusterLabelFontSize(level, e.target.value);
                            }}
                          />
                        </GridCell>
                      </Fragment>
                    ))}
                  </Grid>
                </Section>
              </Panel>

              <Panel>
                <Header>{i18n("Growth mode colors")}</Header>
                <Section>
                  <FormControl>
                    <Label>{i18n("Start")}</Label>
                    <ColorInput
                      value={colorInputValues.start}
                      onInput={(e) => {
                        e.preventDefault();
                        setGrowthRatingColor("start", e.currentTarget.value);
                      }}
                    />
                  </FormControl>
                </Section>
                <Section>
                  <FormControl>
                    <Label>{i18n("Mid")}</Label>
                    <ColorInput
                      value={colorInputValues.middle}
                      onInput={(e) => {
                        e.preventDefault();
                        setGrowthRatingColor("middle", e.currentTarget.value);
                      }}
                    />
                  </FormControl>
                </Section>
                <Section>
                  <FormControl>
                    <Label>{i18n("End")}</Label>
                    <ColorInput
                      value={colorInputValues.end}
                      onInput={(e) => {
                        e.preventDefault();
                        setGrowthRatingColor("end", e.currentTarget.value);
                      }}
                    />
                  </FormControl>
                </Section>
              </Panel>
            </Panels>
          </ScrollArea>
        )}
        <TitleBar onClick={onToggleClick} role="button">
          <Title>{i18n("Dev tools")}</Title>
          <Toggle>
            <SrOnly>{isExpanded ? i18n("Minimize") : i18n("Expand")}</SrOnly>
            <Icon $expanded={isExpanded}>{isExpanded ? "▼" : "▲"}</Icon>
          </Toggle>
        </TitleBar>
      </Form>
    </>
  );
};

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  cursor: pointer;
`;

const Form = styled.form`
  color: #666;
  width: 600px;
  max-height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

const ScrollArea = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
`;

const TitleBar = styled.div`
  background-color: #f0f0f0;
  display: flex;
  justify-content: space-between;
  flex: 0 0 auto;
  cursor: pointer;
`;

const Toggle = styled.div`
  width: 45px;
  height: 45px;
  display: flex;
  padding: 12px;
  background-color: #e4e4e4;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #d8d8d8;
  }
`;

const Icon = styled.div<{ $expanded: boolean }>`
  color: #999;
  font-size: 12px;
`;

const Title = styled.h2`
  margin: 12px;
  font-size: 18px;
`;

const Header = styled.h3`
  margin: 4px 0 8px;
  font-size: 16px;
`;

const Panels = styled.div`
  margin: 12px 12px 0;
  padding: 0 0 12px 0;
  column-count: 2;
  column-gap: 16px;
`;

const Panel = styled.div`
  margin: 0 0 16px;
  break-inside: avoid;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Section = styled.div`
  margin: 4px 0 8px;
`;

const FormControl = styled.label`
  display: flex;
  flex-direction: column;
`;

const Label = styled.div`
  margin-bottom: 4px;
`;

const Input = styled.input`
  margin: 0 0 8px;
  padding: 4px;
  display: block;
`;

const ColorInput = styled.input.attrs({ type: "color" })`
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  gap: 4px 8px;
  align-items: center;
`;

const GridHead = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #888;
`;

const GridCell = styled.div`
  display: flex;
  align-items: center;
`;

const CompactInput = styled.input`
  width: 100%;
  padding: 2px 4px;
  font-size: 12px;
`;

const Muted = styled.span`
  color: #aaa;
  font-size: 12px;
`;
