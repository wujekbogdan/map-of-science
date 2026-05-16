import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import closeIcon from "../Header/close.svg";

export const CLOSE_BUTTON_SIZE_PX = 28;

type Props = {
  onClose: () => void;
  children: ReactNode;
};

export const ContextPanel = ({ onClose, children }: Props) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CloseButton
        type="button"
        aria-label={t("article.close")}
        onClick={onClose}
      >
        <img src={closeIcon} alt="" />
      </CloseButton>
      {children}
    </Card>
  );
};

const Card = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 26px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  padding: var(--chrome-offset);
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--chrome-offset);
  right: var(--chrome-offset);
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
