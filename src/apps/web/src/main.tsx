import "normalize.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App.tsx";
import "./css/global.css";
import "./i18n";
import { Providers } from "./providers/Providers.tsx";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No #root element found in the document");
}

createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
