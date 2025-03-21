"use client";

import * as React from "react";
import { ThemeProvider, createTheme, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { Provider } from "react-redux";
import { store } from "@/store/store";

const muiCache = createCache({ key: "mui", prepend: true });

const theme = createTheme({
    typography: {
        fontFamily: "Geist, Arial, sans-serif",
    },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <CacheProvider value={muiCache}>
                <StyledEngineProvider injectFirst> {/* Fixes MUI styling issues */}
                    <ThemeProvider theme={theme}>
                        <CssBaseline /> {/* Ensures consistent MUI styling */}
                        {children}
                    </ThemeProvider>
                </StyledEngineProvider>
            </CacheProvider>
        </Provider>
    );
}
