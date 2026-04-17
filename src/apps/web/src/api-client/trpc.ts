import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { Router } from "@map-of-science/api";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<Router>();
