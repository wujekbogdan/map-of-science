import {
  flip,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { Switch } from "@headlessui/react";
import i18next from "i18next";
import { ChangeEvent, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../../store.ts";
import { LangCode } from "../../../useLanguage.ts";
import LanguageSelector from "./LanguageSelector.tsx";

// import helpIcon from "./help.svg";

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
  const { t } = useTranslation();
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
  const modeLabel = {
    regular: t("toggles.mode.regular"),
    growth: t("toggles.mode.growth"),
  }[mapMode];

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

  const onMapdModeChange = (checked: boolean) => {
    const mode = checked ? "regular" : "growth";
    setMapMode(mode);
  };

  const onLanguageSelect = (lang: LangCode) => {
    i18next.changeLanguage(lang).catch((err) => {
      console.error("Failed to change language:", err);
    });
  };

  return (
    <Wrap>
      <TogglesList>
        <TogglesListItem>
          <Label>{modeLabel}</Label>
          <Switch
            ref={modeTooltip.refs.setReference}
            {...modeTooltip.getReferenceProps()}
            checked={mapMode === "regular"}
            onChange={onMapdModeChange}
            as={Fragment}
          >
            {({ checked }) => (
              <Toggle $checked={checked}>
                <SrOnly>{t(`toggles.mode.${mapMode}`)}</SrOnly>
              </Toggle>
            )}
          </Switch>
        </TogglesListItem>

        <TogglesListItem>
          <Label htmlFor="cluster-count">
            {t("toggles.clusterCountLabel")}
          </Label>
          <Input
            ref={clusterCountTooltip.refs.setReference}
            {...clusterCountTooltip.getReferenceProps()}
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
        </TogglesListItem>

        <TogglesListItem>
          <LanguageSelector onSelect={onLanguageSelect} />
        </TogglesListItem>
      </TogglesList>

      <Tooltip
        ref={modeTooltip.refs.setFloating}
        style={{ ...modeTooltip.styles }}
        {...modeTooltip.getFloatingProps()}
      >
        <List>
          <ListItem>
            <strong>{t("toggles.tooltip.mode.regular.title")}</strong> <br />
            {t("toggles.tooltip.mode.regular.description")}
          </ListItem>
          <ListItem>
            <strong>{t("toggles.tooltip.mode.growth.title")}</strong> <br />
            {t("toggles.tooltip.mode.growth.description")}
          </ListItem>
        </List>
      </Tooltip>
      <Tooltip
        ref={clusterCountTooltip.refs.setFloating}
        style={{ ...clusterCountTooltip.styles }}
        {...clusterCountTooltip.getFloatingProps()}
      >
        <P>{t("toggles.tooltip.clusterCount.description.line1")}</P>
        <P>{t("toggles.tooltip.clusterCount.description.line2")}</P>
        <P>
          <Em>{t("toggles.tooltip.clusterCount.description.note")}</Em>
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

const Toggle = styled.button<{ $checked: boolean }>`
  --width: 60px;
  --knob-size: 16px;
  --padding: 6px;
  --border: 1px;

  box-sizing: border-box;
  padding: var(--padding);
  border: var(--border) solid #9b5b9b;
  appearance: none;
  cursor: pointer;
  width: var(--width);
  border-radius: 16px;
  background: #fff;

  &:after {
    box-sizing: border-box;

    content: "";
    display: block;
    width: var(--knob-size);
    height: var(--knob-size);
    background: #9b5b9b;
    border-radius: 50%;
    transform: ${({ $checked }) =>
      $checked
        ? "translateX(0)"
        : "translateX(calc(var(--width) - var(--knob-size) - var(--padding) * 2 - var(--border) * 2))"};
    transition: transform 0.2s ease-in-out;
  }
`;

// const Info = styled.div`
//   width: 24px;
//   height: 24px;
//   margin-left: 12px;
//   background-image: url("${helpIcon}");
//   background-size: contain;
//   cursor: help;
//   &:hover {
//     opacity: 0.8;
//   }
// `;

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
