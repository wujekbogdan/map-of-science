import { ChangeEventHandler, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { formatScore } from "../../formatScore.ts";
import { MIN_SCORE_DEFAULT } from "./filter.ts";

type Props = {
  value: number;
  onChange: (next: number) => void;
};

export const MinScoreFilter = ({ value, onChange }: Props) => {
  const { t } = useTranslation();
  // Display text is owned locally while the user types so an external value
  // change (e.g. URL re-resolving to default after a clear) does not overwrite
  // the in-progress input.
  const [inputText, setInputText] = useState(() => String(value));
  const [focused, setFocused] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);

  if (value !== previousValue) {
    setPreviousValue(value);
    if (!focused) setInputText(String(value));
  }

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const raw = event.target.value;
    setInputText(raw);
    if (raw === "") {
      onChange(MIN_SCORE_DEFAULT);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    onChange(parsed);
  };

  const onFocus = () => {
    setFocused(true);
  };

  const onBlur = () => {
    setFocused(false);
    setInputText(String(value));
  };

  return (
    <Field>
      <Label htmlFor="min-score-filter">{t("search.filters.minScore")}</Label>
      <Input
        id="min-score-filter"
        type="number"
        min={0}
        max={1}
        step={0.01}
        value={inputText}
        placeholder={formatScore(MIN_SCORE_DEFAULT)}
        onChange={onInputChange}
        onFocus={onFocus}
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
