import React from "react";
import ReactDOM from "react-dom/client";
import "@mantine/core/styles.css";
import { MantineProvider, Box } from "@mantine/core";
import App from "./App";
import { theme } from "./theme";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Box
        style={{
          paddingTop: "var(--safe-area-top, 0px)",
          paddingBottom: "var(--safe-area-bottom, 0px)",
        }}
      >
        <App />
      </Box>


    </MantineProvider>
  </React.StrictMode>
);