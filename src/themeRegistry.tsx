"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ThemeProvider, createTheme } from "@mui/material"; // Fix import here
import CssBaseline from "@mui/material/CssBaseline"; // Fix: Correct import path
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { Provider } from "react-redux";
import { store } from "@/store/store";

// Create Emotion cache for styles
const muiCache = createCache({ key: "mui", prepend: true });

const theme = createTheme({
    typography: {
        fontFamily: "Geist, Arial, sans-serif",
    },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    useServerInsertedHTML(() => <style id="emotion-global" dangerouslySetInnerHTML={{ __html: "" }} />);

    return (
        <Provider store={store}>
            <CacheProvider value={muiCache}>
                <ThemeProvider theme={theme}>
                    <CssBaseline /> {/* Ensures consistent Material-UI styles */}
                    {children}
                </ThemeProvider>
            </CacheProvider>
        </Provider>
    );
}
