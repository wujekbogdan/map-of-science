import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export const useLanguageQueryInvalidator = () => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const lastLanguage = useRef(i18n.language);

  useEffect(() => {
    const onLanguageChanged = (language: string) => {
      if (language === lastLanguage.current) return;
      lastLanguage.current = language;
      void queryClient.invalidateQueries();
    };
    i18n.on("languageChanged", onLanguageChanged);
    return () => {
      i18n.off("languageChanged", onLanguageChanged);
    };
  }, [queryClient, i18n]);
};
