import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/theme-utils";
// import "react-circular-progressbar/dist/styles.css";
import "react-datepicker/dist/react-datepicker.css";

import { RecoilRoot } from "recoil";
import { ThemeProvider } from "@material-tailwind/react";
import { StreamChatProvider } from "./context/StreamChatContext.jsx";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiConfigProvider } from "./wagmi";

const styles = {
  global: (props) => ({
    body: {
      color: mode("gray.800", "whiteAlpha: 900")(props),
      bg: mode("gray.100", "#101010")(props),
    },
  }),
};

const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const colors = {
  gray: {
    light: "#616161",
    dark: "#1e1e1e",
  },
};

const theme = extendTheme({ config, styles, colors });

ReactDOM.createRoot(document.getElementById("root")).render(
  <RecoilRoot>
    {/* <React.StrictMode> */}
    <ThemeProvider>
      <StreamChatProvider>
        <BrowserRouter>
          <ChakraProvider theme={theme}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <WagmiConfigProvider>
              <Routes>
                <Route path="/*" element={<App />} />
              </Routes>
            </WagmiConfigProvider>
          </ChakraProvider>
        </BrowserRouter>
        {/* </React.StrictMode> */}
      </StreamChatProvider>
    </ThemeProvider>
  </RecoilRoot>
);
