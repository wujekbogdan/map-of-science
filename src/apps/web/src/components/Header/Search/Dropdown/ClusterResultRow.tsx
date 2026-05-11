import styled from "styled-components";
import { formatScore } from "./formatScore.ts";
import {
  CountLabel,
  MetaGroup,
  RowLine,
  ScoreLabel,
  type Token,
} from "./resultRowLayout.ts";

const DOT_BOX_PX = 18;
const DOT_BOX_HALF_PX = DOT_BOX_PX / 2;
const DOT_VIEW_BOX = `-${DOT_BOX_HALF_PX} -${DOT_BOX_HALF_PX} ${DOT_BOX_PX} ${DOT_BOX_PX}`;

type Props = {
  tokens: Token[];
  articlesCount: number;
  score: number;
  dotRadiusPx: number;
};

export const ClusterResultRow = ({
  tokens,
  articlesCount,
  score,
  dotRadiusPx,
}: Props) => (
  <RowLine>
    <MetaGroup>
      <svg width={DOT_BOX_PX} height={DOT_BOX_PX} viewBox={DOT_VIEW_BOX}>
        <circle r={dotRadiusPx} fill="#fff" stroke="#333" strokeWidth={1} />
      </svg>
      <CountLabel>{articlesCount}</CountLabel>
    </MetaGroup>
    <Name>
      {tokens.map((token, index) => (
        <NameToken key={index} $type={token.type} data-test-token={token.type}>
          {token.text}
        </NameToken>
      ))}
    </Name>
    <ScoreLabel>{formatScore(score)}</ScoreLabel>
  </RowLine>
);

const Name = styled.span`
  min-width: 0;
`;

const NameToken = styled.span<{
  $type: "regular" | "bold";
}>`
  color: #1f1f1f;
  font-weight: ${({ $type }) => ($type === "bold" ? "bold" : "normal")};
`;
