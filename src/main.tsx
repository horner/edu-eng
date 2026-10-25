import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mieweb/ui/styles.css";
import "@xyflow/react/dist/style.css";
import "./styles.css";
import App from "./App";
import { AppTheme } from "./theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppTheme>
      <App />
    </AppTheme>
  </StrictMode>,
);
