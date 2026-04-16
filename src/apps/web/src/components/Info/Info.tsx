import { useTranslation } from "react-i18next";
import { styled } from "styled-components";
import { useShallow } from "zustand/react/shallow";
import { useArticleStore } from "../../article/articleStore.ts";
import { breakpoints } from "../../useBreakpoint.ts";
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

const offset = {
  sm: "6px",
  lg: "12px",
};

const Wrapper = styled.div`
  padding: ${offset.sm};

  @media (min-width: ${breakpoints.lg}) {
    padding: ${offset.lg};
  }
`;

const iconSize = {
  sm: "16px",
  lg: "24px",
};

const Button = styled.button`
  appearance: none;
  background: rgba(255, 255, 255, 0.9);
  padding: ${offset.sm};
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #eee;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.1s ease-in-out;
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;

  @media (min-width: ${breakpoints.lg}) {
    padding: ${offset.lg};
    font-size: 16px;
  }

  &:before {
    display: block;
    width: ${iconSize.sm};
    height: ${iconSize.sm};
    content: "";
    background: url("${helpIon}") no-repeat center center;
    background-size: ${iconSize.sm};
    margin-right: ${offset.sm};

    @media (min-width: ${breakpoints.lg}) {
      margin-right: ${offset.lg};
      width: ${iconSize.lg};
      height: ${iconSize.lg};
      background-size: ${iconSize.lg};
    }
  }

  &:hover {
    background-color: #f0f0f0;
  }
`;

export default Info;
