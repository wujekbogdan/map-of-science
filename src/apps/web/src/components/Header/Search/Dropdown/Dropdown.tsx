import {
  Combobox as ComboboxHeadless,
  ComboboxInput as ComboboxInputHeadless,
  ComboboxOptions as ComboboxOptionsHeadless,
  ComboboxOption as ComboboxOptionHeadless,
} from "@headlessui/react";
import {
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import type { SelectedCluster } from "../../../../map/selectionStore.ts";
import { useClusterDotRadius } from "../../../Map/Clusters/clusterLevel.ts";
import { ClusterResultRow } from "./ClusterResultRow.tsx";
import { Spinner } from "./Spinner.tsx";
import { SubmitRow } from "./SubmitRow.tsx";
import CloseIcon from "./close.svg";
import {
  ROW_GAP_PX,
  SIZE_COLUMN_WIDTH_PX,
  type Token,
} from "./resultRowLayout.ts";

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
  query: string;
  options: Option[];
  selectedOptionId: string | null;
  matchCount: number | undefined;
  isQuerySubmittable: boolean;
  onSelect: (option: Option) => void;
  onReset: () => void;
  onInput: (query: string) => void;
  onItemHover: (clusterId: string | null) => void;
  isFetching: boolean;
  filters?: ReactNode;
};

// HeadlessUI Combobox keeps DOM focus on the input and tracks the active
// option via aria-activedescendant, so neither row mouse events nor onFocus
// give us a signal that covers arrow-key navigation. The render-prop
// activeOption is the only unified source for "currently focused option"
// across mouse and keyboard, and bridging it into the store is a sync to an
// external system - the textbook effect case.
const HoverReporter = ({
  activeOption,
  onItemHover,
}: {
  activeOption: Option | null;
  onItemHover: (clusterId: string | null) => void;
}) => {
  useEffect(() => {
    const id =
      activeOption?.type === "cluster" ? activeOption.cluster.id : null;
    onItemHover(id);
    // Pair every set with a cleanup-clear so transitions, remounts, and
    // unmounts all converge on null - nothing can leave a stale id behind.
    return () => {
      onItemHover(null);
    };
  }, [activeOption, onItemHover]);
  return null;
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

export const Dropdown = (props: DropdownProps) => {
  const { t } = useTranslation();
  const { options: rawOptions, value, query } = props;
  const getDotRadius = useClusterDotRadius();

  const options = useMemo(
    () =>
      rawOptions.map((option) => ({
        ...option,
        tokens: tokenizeLabel(option.label, query),
      })),
    [rawOptions, query],
  );
  const allClusters = useMemo(
    () =>
      rawOptions
        .filter((option) => option.type === "cluster")
        .map((option) => option.cluster),
    [rawOptions],
  );

  const showHelpText = !props.isQuerySubmittable && value.length > 0;

  const placeholders = Array.from({ length: 10 }, (_, i) =>
    t(`search.dropdown.placeholder.${i + 1}`),
  );
  const { current: randomPlaceholder } = useRef<string>(
    placeholders[Math.floor(Math.random() * placeholders.length)],
  );

  const submitOption = useMemo<Option>(
    () => ({
      type: "submit",
      id: "submit-query",
      label: value,
      keyword: value,
      clusters: allClusters,
    }),
    [value, allClusters],
  );

  const optionById = useMemo(
    () =>
      new Map<string, Option>(
        [submitOption, ...rawOptions].map((option) => [option.id, option]),
      ),
    [rawOptions, submitOption],
  );

  // Headless UI keeps the option list open after a selection only in
  // `multiple` mode; single mode hardcodes a close that drops the active
  // option, so keyboard navigation would restart at the top. The list is
  // driven by a single anchor id (`[anchor]` or `[]`); the array/toggle
  // semantics are reduced back to one selected option in `onSelectionChange`.
  const selectedComboboxValue = useMemo(
    () => (props.selectedOptionId ? [props.selectedOptionId] : []),
    [props.selectedOptionId],
  );

  const onQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.onInput(event.target.value);
  };

  const onSelectionChange = (next: string[]) => {
    const toggledId =
      next.find((id) => !selectedComboboxValue.includes(id)) ??
      selectedComboboxValue.find((id) => !next.includes(id));
    const selected =
      toggledId === undefined ? null : optionById.get(toggledId);
    if (!selected) return;
    props.onSelect(selected);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  // Escape resets the search regardless of which element inside the widget
  // holds focus. After a commit focus can leave the input, so a handler bound
  // only to the input would miss it.
  //
  // Headless UI gates its controlled value sync on an internal "typing" flag
  // it sets on every keydown and only clears on selection or when its
  // open/close machine closes. Rendering the options with `static` keeps that
  // machine from running, so after an Escape keydown the flag stays set and a
  // cleared controlled value never reaches the DOM input. Writing the empty
  // value through the native input setter and dispatching the `input` event
  // is the one channel Headless UI reconciles in that state. The store stays
  // the single source of truth; this only reconciles the DOM to it. Tracked
  // for retirement by the dropdown implementation research.
  const resetSearch = () => {
    props.onReset();
    const element = inputRef.current;
    if (!element) return;
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set?.call(element, "");
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.focus();
  };

  const onResetClick = () => {
    resetSearch();
  };

  const onWrapperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      resetSearch();
    }
  };

  const isOpen = value.length > 0;

  return (
    <Wrapper onKeyDown={onWrapperKeyDown}>
      <Combobox
        multiple
        value={selectedComboboxValue}
        immediate
        onChange={onSelectionChange}
      >
        {({ activeOption }) => (
          <div>
            <HoverReporter
              activeOption={
                activeOption === null
                  ? null
                  : (optionById.get(activeOption) ?? null)
              }
              onItemHover={props.onItemHover}
            />
            <ComboboxInput
              ref={inputRef}
              autoComplete="off"
              $open={isOpen}
              placeholder={t("search.dropdown.placeholder", {
                placeholder: randomPlaceholder,
              })}
              displayValue={() => value}
              onChange={onQueryChange}
            />
            {isOpen && (
              <ComboboxOptions
                static
                anchor="bottom start"
                style={{
                  width: "var(--input-width)",
                }}
              >
                {props.filters && (
                  <FiltersSlot
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    {props.filters}
                  </FiltersSlot>
                )}
                <ResultsList>
                  {showHelpText && (
                    <NoResults>{t("search.dropdown.enterMin")}</NoResults>
                  )}
                  {props.isQuerySubmittable && (
                    <>
                      <ComboboxOptionHeadless value={submitOption.id}>
                        {({ focus, selected }) => (
                          <ComboboxOption $focus={focus} $selected={selected}>
                            <SubmitRow
                              query={value}
                              matchCount={props.matchCount}
                            />
                          </ComboboxOption>
                        )}
                      </ComboboxOptionHeadless>
                      {options.length > 0 && (
                        <ColumnHeader>
                          <HeaderSize>
                            {t("search.dropdown.column.size")}
                          </HeaderSize>
                          <HeaderName>
                            {t("search.dropdown.column.name")}
                          </HeaderName>
                        </ColumnHeader>
                      )}
                      {options.map((option) => {
                        if (option.type !== "cluster") return null;
                        return (
                          <ComboboxOptionHeadless
                            key={option.id}
                            value={option.id}
                          >
                            {({ focus, selected }) => (
                              <ComboboxOption
                                $focus={focus}
                                $selected={selected}
                              >
                                <ClusterResultRow
                                  tokens={option.tokens}
                                  articlesCount={option.cluster.articlesCount}
                                  dotRadiusPx={getDotRadius(
                                    option.cluster.articlesCount,
                                  )}
                                />
                              </ComboboxOption>
                            )}
                          </ComboboxOptionHeadless>
                        );
                      })}
                    </>
                  )}
                </ResultsList>
              </ComboboxOptions>
            )}
          </div>
        )}
      </Combobox>
      {props.isFetching ? (
        <InputSlot>
          <Spinner />
        </InputSlot>
      ) : (
        value.length > 0 && (
          <ResetButton role="button" onClick={onResetClick}>
            <SrOnly>{t("search.dropdown.reset")}</SrOnly>
          </ResetButton>
        )
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  display: flex;
`;

const QueryCombobox = ComboboxHeadless<string, true>;
const Combobox = styled(QueryCombobox)`
  flex: 1;
`;

const QueryComboboxInput = ComboboxInputHeadless<string>;
const ComboboxInput = styled(QueryComboboxInput).attrs<{
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease-in-out;

  &:focus {
    outline: none;
  }
`;

const ComboboxOptions = styled(ComboboxOptionsHeadless)`
  --anchor-padding: var(--chrome-offset);
  z-index: 40;
  background-color: #fff;
  box-sizing: border-box;
  border-radius: 0 0 4px 4px;
  border: 2px solid #9b5b9b;
  border-top-width: 0;
  margin-top: -2px;
  display: flex;
  flex-direction: column;
`;

const ResultsList = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
`;

const NoResults = styled.div`
  padding: 12px;
  color: #999;
`;

const FiltersSlot = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${ROW_GAP_PX}px;
  padding: 6px 12px;
  border-bottom: 1px solid #eee;
  color: #999;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HeaderSize = styled.span`
  width: ${SIZE_COLUMN_WIDTH_PX}px;
  flex-shrink: 0;
`;

const HeaderName = styled.span`
  flex: 1;
`;

const ComboboxOption = styled.div<{
  $focus: boolean;
  $selected: boolean;
}>`
  color: #333;
  padding: 12px;
  cursor: pointer;
  background-color: ${({ $focus, $selected }) =>
    $focus ? "#eee" : $selected ? "#f3e8f3" : "transparent"};
  box-shadow: ${({ $selected }) =>
    $selected ? "inset 3px 0 0 #9b5b9b" : "none"};
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

const InputSlot = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
`;
