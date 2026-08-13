import type { ReactNode } from "react";
import styled from "styled-components";
import { rhythm } from "../../typography.ts";

type Props = {
  title?: string;
  children: ReactNode;
};

export const PanelSection = ({ title, children }: Props) => (
  <Section>
    {title !== undefined && <Heading>{title}</Heading>}
    {children}
  </Section>
);

const Section = styled.section`
  margin: 0 0 ${rhythm.space.betweenSections};
`;

const Heading = styled.h3`
  margin: 0 0 ${rhythm.space.afterHeading};
  font-size: ${rhythm.sectionHeading.fontSizePx}px;
  line-height: ${rhythm.sectionHeading.lineHeight};
  font-weight: 600;
`;
