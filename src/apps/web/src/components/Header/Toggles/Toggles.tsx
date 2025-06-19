import {
  flip,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { useState } from "react";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { i18n } from "../../../i18n.ts";
import { useStore } from "../../../store.ts";
import helpIcon from "./help.svg";

const useTooltip = () => {
  const [isVisible, setVisibility] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    middleware: [offset(10), flip(), shift({ padding: 10 })],
    open: isVisible,
    onOpenChange: setVisibility,
  });
  const { styles } = useTransitionStyles(context, {
    duration: { open: 300, close: 0 },
    initial: { opacity: 0 },
    open: { opacity: 1 },
  });
  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return {
    refs,
    styles: { ...floatingStyles, ...styles },
    getReferenceProps,
    getFloatingProps,
  };
};

const Toggles = () => {
  const [
    mapMode,
    setMapMode,
    maxDataPointsInViewport,
    setMaxDataPointsInViewport,
  ] = useStore(
    useShallow((s) => [
      s.mapMode,
      s.setMapMode,
      s.maxDataPointsInViewport,
      s.setMaxDataPointsInViewport,
    ]),
  );

  const modeTooltip = useTooltip();
  const clusterCountTooltip = useTooltip();

  const options = [
    { value: "regular", label: i18n("Standardowy") },
    { value: "growth", label: i18n("Wskaźnik rozwoju") },
  ] as const;

  return (
    <Wrap>
      <TogglesList>
        <TogglesListItem>
          <Label htmlFor="mode">{i18n("Tryb")}</Label>
          <Select
            id="mode"
            value={mapMode}
            onChange={(e) => {
              setMapMode(e.target.value as (typeof options)[number]["value"]);
            }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Info
            ref={modeTooltip.refs.setReference}
            {...modeTooltip.getReferenceProps()}
          />
        </TogglesListItem>

        <TogglesListItem>
          <Label htmlFor="cluster-count">{i18n("Liczba klastrów")}</Label>
          <Input
            id="cluster-count"
            value={maxDataPointsInViewport}
            type="number"
            min={300}
            max={3000}
            step={100}
            onChange={(e) => {
              setMaxDataPointsInViewport(Number(e.target.value));
            }}
          />
          <Info
            ref={clusterCountTooltip.refs.setReference}
            {...clusterCountTooltip.getReferenceProps()}
          />
        </TogglesListItem>
      </TogglesList>

      <Tooltip
        ref={modeTooltip.refs.setFloating}
        style={{ ...modeTooltip.styles }}
        {...modeTooltip.getFloatingProps()}
      >
        <List>
          <ListItem>
            <strong>{i18n("Tryb standardowy.")}</strong> <br /> Lorem ipsum
            dolor sit amet, consectetur adipiscing elit.
          </ListItem>
          <ListItem>
            <strong>{i18n("Tryb wskaźnika rozwoju.")}</strong> <br /> Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </ListItem>
        </List>
      </Tooltip>
      <Tooltip
        ref={clusterCountTooltip.refs.setFloating}
        style={{ ...clusterCountTooltip.styles }}
        {...clusterCountTooltip.getFloatingProps()}
      >
        <P>{i18n("Liczba klastrów wyświetlana jednocześnie na mapie.")}</P>
        <P>
          {i18n(
            "Nie zalecamy zbyt dużych wartości, ponieważ może to spowodować problemy z wydajnością",
          )}
        </P>
        <P>
          <Em>
            {i18n(
              "Pracujemy nad znazcnym poprawieniem wydajności mapy, więc w przyszłości ta wartość będzie mogła być dużo większa.",
            )}
          </Em>
        </P>
      </Tooltip>
    </Wrap>
  );
};

export default Toggles;

const Wrap = styled.div`
  display: flex;
  color: #333;
`;

const Label = styled.label`
  margin-right: 12px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ededed;
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ededed;
  appearance: none;
  cursor: pointer;
`;

const Info = styled.div`
  width: 24px;
  height: 24px;
  margin-left: 12px;
  background-image: url("${helpIcon}");
  background-size: contain;
  cursor: help;
  &:hover {
    opacity: 0.8;
  }
`;

const Tooltip = styled.div`
  max-width: 300px;
  position: relative;
  background-color: #fff;
  padding: 12px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style-position: inside;
  line-height: 1.45;
`;

const ListItem = styled.li`
  padding: 0;
  margin: 0 0 24px 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TogglesList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
`;

const TogglesListItem = styled.li`
  display: flex;
  align-items: center;
  margin-right: 24px;

  &:last-child {
    margin-right: 0;
  }
`;

const P = styled.p`
  margin: 0 0 12px 0;
  line-height: 1.45;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Em = styled.em`
  color: #999;
  font-style: normal;
  font-size: 12px;
`;
