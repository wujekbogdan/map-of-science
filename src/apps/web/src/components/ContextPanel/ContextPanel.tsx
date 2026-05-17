import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import closeIcon from "../Header/close.svg";

const CLOSE_BUTTON_SIZE_PX = 28;

type Props = {
  onClose: () => void;
  header?: ReactNode;
  children: ReactNode;
};

export const ContextPanel = ({ onClose, header, children }: Props) => {
  const { t } = useTranslation();

  return (
    <Card>
      <TopRow>
        {header !== undefined && <Heading>{header}</Heading>}
        <CloseButton
          type="button"
          aria-label={t("article.close")}
          onClick={onClose}
        >
          <img src={closeIcon} alt="" />
        </CloseButton>
      </TopRow>
      {children}
    </Card>
  );
};

const Card = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 26px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: var(--chrome-offset);
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const Heading = styled.h2`
  flex: 1;
  margin: 0;
  font-size: 1em;
  font-weight: normal;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  flex: 0 0 auto;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${CLOSE_BUTTON_SIZE_PX}px;
  height: ${CLOSE_BUTTON_SIZE_PX}px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  color: #555;
  cursor: pointer;

  img {
    width: 14px;
    height: 14px;
    display: block;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.12);
  }
`;
