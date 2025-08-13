import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#3b82f6", // Blue-500
        },
        secondary: {
            main: "#10b981", // Emerald-500
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
                deleteIcon: {
                    "&:hover": {
                        color: "inherit",
                    },
                },
            },
        },
    },
});

interface CustomThemeProviderProps {
    children: React.ReactNode;
}

const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
    children,
}) => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export default CustomThemeProvider;
