// src/components/ThemeProvider.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline, useMediaQuery } from "@mui/material";

const Ctx = createContext(null);

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("mode") || "system");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => { localStorage.setItem("mode", mode); }, [mode]);

  const paletteMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: paletteMode,
        primary: { main: "#6b8afd" },
        secondary: { main: "#22c55e" },
        background: {
          default: paletteMode === "dark" ? "#1D1024" : "#f6f7fb",
          paper:   paletteMode === "dark" ? "#4E2C63" : "#ffffff",
        },
      },
      shape: { borderRadius: 14 },
    }), [paletteMode]
  );

  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return (
    <Ctx.Provider value={{ mode, setMode, toggle }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </Ctx.Provider>
  );
}

export const useColorMode = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
};
