import { ChangeEventHandler, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { MIN_SCORE_DEFAULT } from "../../searchParams.ts";
import { formatScore } from "../formatScore.ts";

type Props = {
  value: number | undefined;
  onChange: (next: number | undefined) => void;
};

const toDisplay = (value: number | undefined) =>
  String(value ?? MIN_SCORE_DEFAULT);

export const MinScoreFilter = ({ value, onChange }: Props) => {
  const { t } = useTranslation();
  // Display text is owned locally while the user types so an external value
  // change (e.g. URL re-resolving to default after a clear) does not overwrite
  // the in-progress input.
  const [inputText, setInputText] = useState(() => toDisplay(value));
  const [focused, setFocused] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);

  if (value !== previousValue) {
    setPreviousValue(value);
    if (!focused) setInputText(toDisplay(value));
  }

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const raw = event.target.value;
    setInputText(raw);
    if (raw === "") {
      onChange(undefined);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    onChange(parsed);
  };

  const onBlur = () => {
    setFocused(false);
    setInputText(toDisplay(value));
  };

  return (
    <Field>
      <Label htmlFor="min-score-filter">{t("search.filters.minScore")}</Label>
      <Input
        id="min-score-filter"
        type="number"
        step={0.01}
        min={0}
        max={1}
        value={inputText}
        placeholder={formatScore(MIN_SCORE_DEFAULT)}
        onChange={onInputChange}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={onBlur}
      />
    </Field>
  );
};

const Field = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
`;

const Label = styled.label`
  color: #888;
`;

const Input = styled.input`
  width: 64px;
  padding: 4px 6px;
  border: 1px solid #ededed;
  background-color: white;
  font-family: inherit;
  font-size: inherit;
  color: #555;
`;
