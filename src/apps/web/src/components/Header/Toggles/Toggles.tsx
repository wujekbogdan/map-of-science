import {
  flip,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { ChangeEvent, useState } from "react";
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
    initial: { opacity: 0, pointerEvents: "none" },
    open: { opacity: 1, pointerEvents: "auto" },
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
  const [clusterInput, setClusterInputValue] = useState(
    String(maxDataPointsInViewport),
  );
  const clusterInputRange = {
    min: 1,
    max: 3000,
  };
  const isClusterCountValid = (() => {
    const num = Number(clusterInput);
    return (
      clusterInput !== "" &&
      !isNaN(num) &&
      num >= clusterInputRange.min &&
      num <= clusterInputRange.max
    );
  })();

  const modeTooltip = useTooltip();
  const clusterCountTooltip = useTooltip();

  const options = [
    { value: "regular", label: i18n("Widok zwykły") },
    { value: "growth", label: i18n("Wkaźnik rozwoju") },
  ] as const;

  const onClusterInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setClusterInputValue(val);

    const num = Number(val);
    if (
      val !== "" &&
      !isNaN(num) &&
      num >= clusterInputRange.min &&
      num <= clusterInputRange.max
    ) {
      setMaxDataPointsInViewport(num);
    }
  };

  const onClusterInputBlur = () => {
    setClusterInputValue(maxDataPointsInViewport.toString());
  };

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
            $invalid={!isClusterCountValid}
            id="cluster-count"
            value={clusterInput}
            type="number"
            min={clusterInputRange.min}
            max={clusterInputRange.max}
            step={100}
            onChange={onClusterInputChange}
            onBlur={onClusterInputBlur}
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
            <strong>{i18n("Wskaźnik rozwoju")}</strong> <br /> Kolor klastra reprezentuje tempo jego rozwoju, w porównaniu z innymi klastrami. Klastry oznaczone kolorem niebieskim rozwijają się najwolniej. Klastry oznaczone kolorem czerwonym rozwijają się najszybciej.<br>
          </ListItem>
        </List>
      </Tooltip>
      <Tooltip
        ref={clusterCountTooltip.refs.setFloating}
        style={{ ...clusterCountTooltip.styles }}
        {...clusterCountTooltip.getFloatingProps()}
      >
        <P><strong>{i18n("Liczba klastrów wyświetlanych jednocześnie na mapie")}</strong></P>
        <P>
          {i18n(
            "Liczba wszystkich klastrów w bazie to ok. 86 tysięcy. Aplikacja wyświetla zawsze tylko ustaloną liczbę największych klastrów. Wartość domyślna to 500. Obecnie maksymalna dostępna wartość to 3000. Uwaga: mapa może działać wolniej, gdy wyświetla naraz więcej klastrów.",
          )}
        </P>
        <P>
          <Em>
            {i18n(
              "Pracujemy nad znacznym poprawieniem wydajności mapy.",
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

const Input = styled.input<{ $invalid?: boolean }>`
  padding: 12px;
  border: 1px solid ${({ $invalid }) => ($invalid ? "crimson" : "#ededed")};
  background-color: ${({ $invalid }) => ($invalid ? "#fff6f6" : "white")};
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
