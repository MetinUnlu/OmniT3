"use client";

import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  fontFamily: "var(--font-geist-sans)",
  primaryColor: "blue",
  defaultRadius: "md",
  colors: {
    brand: [
      "#f0f4f8",
      "#d9e2ec",
      "#bcccdc",
      "#9fb3c8",
      "#829ab1",
      "#627d98",
      "#486581",
      "#334e68",
      "#243b53",
      "#102a43",
    ],
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
