import React from "react";
import ReactDOM from "react-dom/client";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import App from "./App";
import { theme } from "./theme";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="light">

        <App />

      </MantineProvider>
  </React.StrictMode>
);