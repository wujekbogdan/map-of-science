import { initTRPC } from "@trpc/server";
import type { Context } from "./context.js";

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
