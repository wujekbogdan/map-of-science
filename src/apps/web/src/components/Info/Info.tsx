import { useTranslation } from "react-i18next";
import { styled } from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { useArticleStore } from "../../store.ts";
import { useLanguage } from "../../useLanguage.ts";
import helpIon from "./help.svg";

const Info = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [fetchGeneralInfo] = useArticleStore(
    useShallow((s) => [s.fetchGeneralInfo]),
  );

  const onClick = () => {
    fetchGeneralInfo(language).catch((err) => {
      console.error("Error fetching site info", err);
    });
  };

  return (
    <Wrapper>
      <Button onClick={onClick}>{t("info.about")}</Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 12px;
`;

const Button = styled.button`
  appearance: none;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #eee;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.1s ease-in-out;
  display: flex;
  align-items: center;
  color: #666;

  &:before {
    display: block;
    width: 24px;
    height: 24px;
    object-fit: contain;
    content: url("${helpIon}");
    margin-right: 12px;
  }

  &:hover {
    background-color: #f0f0f0;
  }
`;

export default Info;
