import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Router } from "@map-of-science/api";
import {
  langToLocale,
  TRPCProvider,
  useLanguageQueryInvalidator,
} from "../api-client/index.ts";
import { config } from "../config.ts";
import { toLangCode } from "../useLanguage.ts";

type Props = {
  children: ReactNode;
};

const LanguageQuerySync = () => {
  useLanguageQueryInvalidator();
  return null;
};

export const Providers = ({ children }: Props) => {
  const { i18n } = useTranslation();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<Router>({
      links: [
        httpBatchLink({
          url: config.apiUrl,
          headers: () => ({
            "accept-language": langToLocale(toLangCode(i18n.language)),
          }),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <LanguageQuerySync />
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
};
