import { ReactElement, ReactNode, useRef } from "react";
import { useClickAway, useKey } from "react-use";
import styled from "styled-components";
import { breakpoints } from "../../useBreakpoint.ts";
import { ContextPanel } from "../ContextPanel/ContextPanel.tsx";

type Props = {
  children: ReactElement;
  onClose?: () => void;
  header?: ReactNode;
};

export const ArticleModal = ({ children, onClose, header }: Props) => {
  const ref = useRef(null);

  useClickAway(ref, () => {
    onClose?.();
  });

  useKey("Escape", () => {
    onClose?.();
  });

  return (
    <Overlay>
      <PositionWrapper ref={ref}>
        <ContextPanel
          header={header}
          onClose={() => {
            onClose?.();
          }}
        >
          <Body>{children}</Body>
        </ContextPanel>
      </PositionWrapper>
    </Overlay>
  );
};

// This feels like a hack, and indeed it is a hack. useClickAway doesn't seem to
// recognize when the click event's target is an SVG element. One way to fix
// this would be to set pointer-events to none on the SVG element, but this
// would create unnecessary complexity and coupling, so I went with a
// transparent overlay instead that will catch the click.
const Overlay = styled.div`
  z-index: 100;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const PositionWrapper = styled.div`
  position: fixed;
  top: 12px;
  right: 12px;
  bottom: 12px;
  left: 12px;

  @media (min-width: ${breakpoints.lg}) {
    top: 36px;
    right: auto;
    bottom: 36px;
    left: 50%;
    width: 50%;
    transform: translateX(-50%);
  }
`;
