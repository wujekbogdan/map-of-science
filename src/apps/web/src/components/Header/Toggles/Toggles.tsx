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

const Toggles = () => {
  const [mapMode, setMapMode] = useStore(
    useShallow((s) => [s.mapMode, s.setMapMode]),
  );
  const [isTooltipVisible, setTooltipVisibility] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    middleware: [offset(10), flip(), shift({ padding: 10 })],
    open: isTooltipVisible,
    onOpenChange: setTooltipVisibility,
  });
  const { styles } = useTransitionStyles(context, {
    duration: { open: 300, close: 0 },
    initial: { opacity: 0 },
    open: { opacity: 1 },
  });
  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const options = [
    { value: "regular", label: i18n("Standardowy") },
    { value: "growth", label: i18n("Wskaźnik rozwoju") },
  ] as const;

  return (
    <Wrap>
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
      <Info ref={refs.setReference} {...getReferenceProps()} />
      <Tooltip
        ref={refs.setFloating}
        style={{ ...floatingStyles, ...styles }}
        {...getFloatingProps()}
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
    </Wrap>
  );
};

export default Toggles;

const Wrap = styled.div`
  display: flex;
  color: #333;
  align-items: center;
`;

const Label = styled.label`
  margin-right: 12px;
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
  padding: 8px;
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
