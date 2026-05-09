import {
  Combobox as ComboboxHeadless,
  ComboboxInput as ComboboxInputHeadless,
  ComboboxOptions as ComboboxOptionsHeadless,
  ComboboxOption as ComboboxOptionHeadless,
} from "@headlessui/react";
import { ChangeEvent, memo, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import type { SelectedCluster } from "../../../../map/selectionStore.ts";
import Label, { Token } from "./Label.tsx";
import CloseIcon from "./close.svg";

type OptionBase = {
  label: string;
  keyword: string;
  id: string;
};

export type Option =
  | (OptionBase & {
      type: "cluster";
      cluster: SelectedCluster;
    })
  | (OptionBase & {
      type: "submit";
      clusters: SelectedCluster[];
    });

type DropdownProps = {
  value: string;
  options: Option[];
  isQuerySubmittable: boolean;
  onSelect: (option: Option) => void;
  onReset: () => void;
  onInput: (query: string) => void;
  isLoading: boolean;
};

const tokenizeLabel = (label: string, query: string): Token[] => {
  const i = label.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return [{ text: label, type: "regular" }];

  const before = label.slice(0, i);
  const match = label.slice(i, i + query.length);
  const after = label.slice(i + query.length);

  return [
    { text: before, type: "regular" } as const,
    { text: match, type: "bold" } as const,
    { text: after, type: "regular" } as const,
  ].filter(({ text }) => text);
};

type OptionRowProps = {
  id: string;
  focus: boolean;
  selected: boolean;
  tokens: Token[];
  type: "submit" | "cluster";
};

const OptionRow = memo(
  function OptionRow(props: OptionRowProps) {
    return (
      <ComboboxOption $focus={props.focus} $selected={props.selected}>
        <Label tokens={props.tokens} type={props.type} />
      </ComboboxOption>
    );
  },
  (prev, next) =>
    prev.id === next.id &&
    prev.selected === next.selected &&
    prev.focus === next.focus,
);

export const Dropdown = (props: DropdownProps) => {
  const { t } = useTranslation();
  const { options: rawOptions, value } = props;
  const [selection, setSelection] = useState<Option | null>(null);

  const options = useMemo(
    () =>
      rawOptions.map((option) => ({
        ...option,
        tokens: tokenizeLabel(option.label, value),
      })),
    [rawOptions, value],
  );
  const allClusters = useMemo(
    () =>
      rawOptions
        .filter((option) => option.type === "cluster")
        .map((option) => option.cluster),
    [rawOptions],
  );

  const showHelpText = !props.isQuerySubmittable && value.length > 0;
  const showLoadingText = props.isQuerySubmittable && props.isLoading;

  const placeholders = Array.from({ length: 10 }, (_, i) =>
    t(`search.dropdown.placeholder.${i + 1}`),
  );
  const { current: randomPlaceholder } = useRef<string>(
    placeholders[Math.floor(Math.random() * placeholders.length)],
  );

  const submitOption: Option = {
    type: "submit",
    id: "submit-query",
    label: value,
    keyword: value,
    clusters: allClusters,
  };

  const onQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelection(null);
    props.onInput(event.target.value);
  };

  const onSelectionChange = (selected: Option | null) => {
    if (!selected) return;
    setSelection(selected);
    props.onSelect(selected);
  };

  const onResetClick = () => {
    setSelection(null);
    props.onReset();
  };

  return (
    <Wrapper>
      <Combobox value={selection} immediate onChange={onSelectionChange}>
        {({ open }) => (
          <div>
            <ComboboxInput
              autoComplete="off"
              $open={open}
              placeholder={t("search.dropdown.placeholder", {
                placeholder: randomPlaceholder,
              })}
              displayValue={(option: Option | null) => option?.keyword ?? value}
              onChange={onQueryChange}
            />
            <ComboboxOptions
              anchor="bottom start"
              style={{
                width: "var(--input-width)",
              }}
            >
              {showHelpText && (
                <NoResults>{t("search.dropdown.enterMin")}</NoResults>
              )}
              {showLoadingText && (
                <NoResults>{t("search.dropdown.loading")}…</NoResults>
              )}
              {props.isQuerySubmittable && !showLoadingText && (
                <>
                  <ComboboxOptionHeadless value={submitOption}>
                    {({ focus, selected }) => (
                      <ComboboxOption $focus={focus} $selected={selected}>
                        <Label type="submit">
                          {t("search.dropdown.searchLabel")}:{" "}
                          <strong>{value}</strong>
                          {allClusters.length > 0 && ` [${allClusters.length}]`}
                        </Label>
                      </ComboboxOption>
                    )}
                  </ComboboxOptionHeadless>
                  {options.map((option) => (
                    <ComboboxOptionHeadless key={option.id} value={option}>
                      {({ focus, selected }) => (
                        <OptionRow
                          type={option.type}
                          id={option.id}
                          focus={focus}
                          selected={selected}
                          tokens={option.tokens}
                        />
                      )}
                    </ComboboxOptionHeadless>
                  ))}
                </>
              )}
            </ComboboxOptions>
          </div>
        )}
      </Combobox>
      {selection && (
        <ResetButton role="button" onClick={onResetClick}>
          <SrOnly>{t("search.dropdown.reset")}</SrOnly>
        </ResetButton>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  display: flex;
`;

const TypedCombobox = ComboboxHeadless<Option | null>;
const Combobox = styled(TypedCombobox)`
  flex: 1;
`;

const TypedComboboxInput = ComboboxInputHeadless<Option | null>;
const ComboboxInput = styled(TypedComboboxInput).attrs<{
  placeholder?: string;
  autoComplete?: string;
}>((props) => ({
  type: "text",
  placeholder: props.placeholder ?? "",
  autoComplete: props.autoComplete ?? "",
}))<{ $open: boolean }>`
  font-size: 16px;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  padding: 12px;
  border-width: 2px;
  border-style: solid;
  border-color: ${(props) =>
    props.$open ? "#9B5B9B #9B5B9B #fff #9B5B9B" : "#9B5B9B"};
  border-radius: ${({ $open }) => ($open ? "4px 4px 0 0" : "4px")};
  color: #333;
  transition: box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
  }
`;

const ComboboxOptions = styled(ComboboxOptionsHeadless)`
  z-index: 40;
  background-color: #fff;
  box-sizing: border-box;
  border-radius: 0 0 4px 4px;
  border: 2px solid #9b5b9b;
  border-top-width: 0;
  margin-top: -2px;
`;

const NoResults = styled.div`
  padding: 12px;
  color: #999;
`;

const ComboboxOption = styled.div<{
  $focus: boolean;
  $selected: boolean;
}>`
  color: #333;
  padding: 12px;
  background-color: ${({ $focus }) => ($focus ? "#eee" : "transparent")};
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

const ResetButton = styled.span`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-image: url("${CloseIcon}");
  width: 24px;
  height: 24px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;
