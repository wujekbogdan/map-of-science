import { ReactElement, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useClickAway, useKey } from "react-use";
import styled from "styled-components";
import { breakpoints } from "../../useBreakpoint.ts";

type Props = {
  children: ReactElement;
  onClose?: () => void;
};

export const ArticleModal = ({ children, onClose }: Props) => {
  const { t } = useTranslation();
  const ref = useRef(null);

  useClickAway(ref, () => {
    onClose?.();
  });

  useKey("Escape", () => {
    onClose?.();
  });

  return (
    <Overlay>
      <ArticleWrapper ref={ref}>
        <Header>
          <CloseButton
            onClick={() => {
              onClose?.();
            }}
          >
            {t("article.close")} ✕
          </CloseButton>
        </Header>
        <Content>{children}</Content>
      </ArticleWrapper>
    </Overlay>
  );
};

// This feels like a hack, and indeed it is a hack. useClickAway doesn't seem to
// recognize when the click event's target is an SVG element. One way to fix
// this would be to set pointer-events to none on the SVG element, but this
// would create unnecessary complexity and coupling, so I went with a
// transparent overlay instead that will catch the click.
const Overlay = styled.div`
  z-index: 30;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const ArticleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 12px;
  right: 12px;
  bottom: 12px;
  left: 12px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.2);
  overflow-y: auto;

  @media (min-width: ${breakpoints.lg}) {
    top: 36px;
    right: auto;
    bottom: 36px;
    left: 50%;
    width: 50%;
    transform: translateX(-50%);
    padding: 12px;
  }
`;

const Header = styled.header`
  display: flex;
`;

const Content = styled.section`
  flex-grow: 1;
`;

const Button = styled.button`
  border-radius: 4px;
  border: 1px solid #ddd;
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    border-color: #ccc;
  }

  &:focus {
    border-color: #999;
    outline: none;
  }
`;

const CloseButton = styled(Button)``;
