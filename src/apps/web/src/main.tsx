import { RouterProvider } from "@tanstack/react-router";
import "normalize.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/global.css";
import "./i18n";
import { Providers } from "./providers/Providers.tsx";
import { router } from "./router.ts";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No #root element found in the document");
}

createRoot(root).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
