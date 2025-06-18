import {
  Combobox as ComboboxHeadless,
  ComboboxInput as ComboboxInputHeadless,
  ComboboxOptions as ComboboxOptionsHeadless,
  ComboboxOption as ComboboxOptionHeadless,
} from "@headlessui/react";
import { ChangeEvent, useMemo, useState, memo, useRef } from "react";
import styled from "styled-components";
import { i18n } from "../../../../i18n.ts";
import Label, { Token } from "./Label.tsx";
import CloseIcon from "./close.svg";

export type BoundingBox = {
  min: { x: number; y: number };
  max: { x: number; y: number };
  center: { x: number; y: number };
};
type Cluster = {
  clusterId: number;
  x: number;
  y: number;
};

type OptionBase = {
  label: string;
  keyword: string;
  id: string;
};
export type Option =
  | (OptionBase & {
      type: "label";
      level: 1 | 2 | 3 | 4;
      x: number;
      y: number;
      videosCount: number;
    })
  | (OptionBase & {
      type: "point";
      clusters: Cluster[];
    })
  | (OptionBase & {
      type: "query";
      clusters: Cluster[];
    });

type Dropdown = {
  options: Option[];
  onSelect: (option: Option) => void;
  onReset: () => void;
  onInput: (query: string) => void;
  isLoading: boolean;
};

const placeholders = [
  "fizyka kwantowa",
  "genetyka",
  "chemia organiczna",
  "bioreaktory",
  "energetyka",
  "rybołówstwo",
  "prawo międzynarodowe",
  "ekonomia behawioralna",
  "cyberbezpieczeństwo",
  "logika rozmyta",
];

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
  type: "query" | "label" | "point";
  videosCount?: number;
};

const OptionRow = memo(
  (props: OptionRowProps) => {
    const videosCountToken =
      props.videosCount === undefined
        ? undefined
        : {
            text: ` [${i18n("Filmy na YouTube:")} ${props.videosCount}]`,
            type: "regular",
          };

    const tokens = [...props.tokens, videosCountToken].filter(
      Boolean,
    ) as Token[];

    return (
      <ComboboxOption $focus={props.focus} $selected={props.selected}>
        <Label tokens={tokens} type={props.type} />
      </ComboboxOption>
    );
  },
  (prev, next) => {
    return (
      prev.id === next.id &&
      prev.selected == next.selected &&
      prev.focus === next.focus
    );
  },
);

export const Dropdown = (props: Dropdown) => {
  const { options: rawOptions } = props;
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Option | null>(null);
  const { options, allClusters } = useMemo(() => {
    const options = rawOptions.map((option) => ({
      ...option,
      tokens: tokenizeLabel(option.label, query),
    }));
    const allClusters = [
      ...new Map(
        options
          .filter((option) => option.type === "point")
          .flatMap((option) => option.clusters)
          .map((cluster) => [cluster.clusterId, cluster]), // Guarantee uniqueness
      ).values(),
    ];

    return { options, allClusters };
  }, [rawOptions, query]);
  const hasNoResultsText = query.length > 1 && options.length === 0;
  const noResultsText = (() => {
    if (query.length < 3) {
      return i18n("Wpisz co najmniej 3 znaki");
    }

    if (props.isLoading) {
      return i18n("Ładowanie...");
    }

    return i18n("Brak wyników");
  })();
  const { current: randomPlaceholder } = useRef<string>(
    placeholders[Math.floor(Math.random() * placeholders.length)],
  );
  const queryOption: Option = {
    type: "query",
    id: "dummy-id",
    label: query,
    keyword: query,
    clusters: allClusters,
  };
  const hasHighlightAllOption = query.length >= 3 && allClusters.length > 0;

  const onQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSelection(null);
    setQuery(query);
    props.onInput(query);
  };

  const onSelectionChange = (selection: Option | null) => {
    if (!selection) return;

    setSelection(selection);
    props.onSelect(selection);
  };

  const onResetClick = () => {
    setSelection(null);
    setQuery("");
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
              placeholder={i18n(
                `Wyszukaj na Mapie Nauki, np. "${randomPlaceholder}"`,
              )}
              displayValue={(option: Option | null) => option?.keyword ?? query}
              onChange={onQueryChange}
            />
            <ComboboxOptions
              anchor="bottom start"
              style={{
                width: "var(--input-width)",
              }}
            >
              {hasNoResultsText ? (
                <NoResults>{noResultsText}</NoResults>
              ) : (
                <>
                  {hasHighlightAllOption && (
                    <ComboboxOptionHeadless value={queryOption}>
                      {({ focus, selected }) => (
                        <ComboboxOption $focus={focus} $selected={selected}>
                          <Label type="query">
                            {i18n("Szukaj")}: <strong>{query}</strong> [
                            {allClusters.length}]
                          </Label>
                        </ComboboxOption>
                      )}
                    </ComboboxOptionHeadless>
                  )}
                  {options.map((option) => (
                    <ComboboxOptionHeadless key={option.id} value={option}>
                      {({ focus, selected }) => (
                        <OptionRow
                          type={option.type}
                          id={option.id}
                          focus={focus}
                          selected={selected}
                          tokens={option.tokens}
                          videosCount={
                            option.type === "label"
                              ? option.videosCount
                              : undefined
                          }
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
          <SrOnly>{i18n("Reset")}</SrOnly>
        </ResetButton>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
`;

const Combobox = styled(ComboboxHeadless)`
  flex: 1;
`;

const ComboboxInput = styled(ComboboxInputHeadless).attrs<{
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
