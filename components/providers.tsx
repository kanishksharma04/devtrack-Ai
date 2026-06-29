"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import React from "react";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme === "light" ? "light" : "dark"}
      toastOptions={{
        style:
          resolvedTheme === "light"
            ? {
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "#0a0a0a",
                borderRadius: "10px",
              }
            : {
                background: "#151515",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#fafafa",
                borderRadius: "10px",
              },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        {children}
        <ThemedToaster />
      </SessionProvider>
    </ThemeProvider>
  );
}
