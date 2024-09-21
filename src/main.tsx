import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@radix-ui/themes/styles.css";

import { Theme } from "@radix-ui/themes";

// for color changing
import { ColorModeProvider } from "./color-mode";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </Theme>
  </React.StrictMode>
);
