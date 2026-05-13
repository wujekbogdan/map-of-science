import { useTranslation } from "react-i18next";
import { styled } from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { useArticleStore } from "../../article/articleStore.ts";
import { useLanguage } from "../../useLanguage.ts";
import helpIcon from "./help.svg";

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

  return <Button onClick={onClick}>{t("info.about")}</Button>;
};

const Button = styled.button`
  appearance: none;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  margin: 0;
  padding: 0;

  &:before {
    display: block;
    width: 16px;
    height: 16px;
    content: "";
    background: url("${helpIcon}") no-repeat center center;
    background-size: 16px;
    margin-right: 6px;
  }
`;

export default Info;
