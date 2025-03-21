"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Create a theme (optional)
const theme = createTheme({
    typography: {
        fontFamily: "Geist, Arial, sans-serif",
    },
});

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline /> {/* Ensures consistent MUI styling */}
                {children}
            </ThemeProvider>
        </Provider>
    );
}
