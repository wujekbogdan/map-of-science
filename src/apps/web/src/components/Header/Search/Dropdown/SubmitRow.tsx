import searchIcon from "../icons/search.svg";
import { RowLine, TrailingIcon } from "./resultRowLayout.ts";

type Props = {
  query: string;
  matchCount: number | undefined;
};

export const SubmitRow = ({ query, matchCount }: Props) => (
  <RowLine>
    <span>
      <strong>{query}</strong>
      {matchCount !== undefined && ` [${matchCount}]`}
    </span>
    <TrailingIcon src={searchIcon} alt="" />
  </RowLine>
);
