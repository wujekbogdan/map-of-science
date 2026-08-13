import type { ReactNode } from "react";
import styled from "styled-components";
import { rhythm } from "../../typography.ts";

type Props = {
  label?: string;
  items: readonly { key: string; content: ReactNode }[];
};

export const LabelledList = ({ label, items }: Props) => {
  if (items.length === 0) return null;

  return (
    <>
      {label !== undefined && <Label>{label}</Label>}
      <List>
        {items.map(({ key, content }) => (
          <li key={key}>{content}</li>
        ))}
      </List>
    </>
  );
};

const Label = styled.h4`
  margin: ${rhythm.space.beforeSubHeading} 0 ${rhythm.space.afterHeading};
  font-size: ${rhythm.subHeading.fontSizePx}px;
  line-height: ${rhythm.subHeading.lineHeight};
  font-weight: 600;
  color: #555;
`;

const List = styled.ul`
  margin: 0;
  padding-left: ${rhythm.space.listIndent};
  font-size: ${rhythm.body.fontSizePx}px;
  line-height: ${rhythm.body.lineHeight};

  li {
    margin-bottom: ${rhythm.space.betweenListItems};
  }
`;
