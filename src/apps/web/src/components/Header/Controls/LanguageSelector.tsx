import { MenuButton, Menu, MenuItem, MenuItems } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { LangCode, useLanguage } from "../../../useLanguage.ts";
import IconEn from "./en.svg?react";
import IconPl from "./pl.svg?react";

const Flag = ({ lang }: { lang: "pl" | "en" }) => {
  const iconMap = {
    en: <IconEn role="presentation" />,
    pl: <IconPl role="presentation" />,
  };

  return iconMap[lang];
};

type Props = {
  onSelect?: (language: LangCode) => void;
};

export const LanguageSelector = (props: Props) => {
  const { t } = useTranslation();
  const { language, supportedLanguages } = useLanguage();

  return (
    <Menu>
      <MenuButton as={Fragment}>
        <Trigger>
          <Text>{t("toggles.languages.language")}</Text>
          <Icon>
            <Flag lang={language} />
          </Icon>
        </Trigger>
      </MenuButton>
      <Items anchor={{ to: "bottom end", offset: 14 }}>
        {supportedLanguages.map((language) => (
          <MenuItem key={language} as={Fragment}>
            {() => (
              <Option onClick={() => props.onSelect?.(language)}>
                <Text>{t(`toggles.languages.${language}`)}</Text>
                <Icon>
                  <Flag lang={language} />
                </Icon>
              </Option>
            )}
          </MenuItem>
        ))}
      </Items>
    </Menu>
  );
};

export default LanguageSelector;

const Trigger = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  column-gap: 8px;
`;

const Option = styled(Trigger)`
  border-radius: 26px;
  margin-bottom: 6px;
  padding: 6px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Items = styled(MenuItems)`
  margin-top: 18px;
  padding: 12px 6px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);

  &:focus {
    outline: none;
  }
`;

const Text = styled.span`
  color: #333;
`;

const Icon = styled.span`
  width: 24px;
  height: 18px;
  border: 1px solid #ededed;
  border-radius: 2px;
  overflow: hidden;

  svg {
    display: block;
    object-fit: contain;
  }

  &:hover {
    opacity: 0.8;
  }
`;
