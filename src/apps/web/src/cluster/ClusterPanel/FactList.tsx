import styled from "styled-components";
import { rhythm } from "../../typography.ts";

type Props = {
  rows: readonly { label: string; value: string }[];
};

export const FactList = ({ rows }: Props) => (
  <List>
    {rows.map(({ label, value }) => (
      <Row key={label}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </Row>
    ))}
  </List>
);

const List = styled.dl`
  margin: 0;
  font-size: ${rhythm.body.fontSizePx}px;
  line-height: ${rhythm.body.lineHeight};
`;

// Each row repeats the same column template, so the values align down the list.
const Row = styled.div`
  display: grid;
  grid-template-columns: 10em 1fr;
  column-gap: ${rhythm.space.labelColumnGap};
  padding: ${rhythm.space.withinRow} 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  &:last-child {
    border-bottom: 0;
  }

  dt {
    font-weight: 600;
  }

  dd {
    margin: 0;
  }
`;
