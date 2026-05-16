import { useTranslation } from "react-i18next";
import searchIcon from "../icons/search.svg";
import { RowLine, TrailingIcon } from "./resultRowLayout.ts";

type Props = {
  query: string;
  matchCount: number;
};

export const SubmitRow = ({ query, matchCount }: Props) => {
  const { t } = useTranslation();

  return (
    <RowLine>
      <span>
        <strong>{query}</strong>
        {` [${t("search.dropdown.submitRow.matchCount", { count: matchCount })}]`}
      </span>
      <TrailingIcon src={searchIcon} alt="" />
    </RowLine>
  );
};
