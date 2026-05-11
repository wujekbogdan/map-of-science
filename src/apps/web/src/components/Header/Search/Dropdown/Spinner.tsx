import { useTranslation } from "react-i18next";
import styled, { keyframes } from "styled-components";

export const Spinner = () => {
  const { t } = useTranslation();
  return <Circle role="img" aria-label={t("search.dropdown.loading")} />;
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Circle = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #9b5b9b;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
