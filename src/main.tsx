import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-serif-display/400-italic.css";
import "@fontsource-variable/manrope/wght.css";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
