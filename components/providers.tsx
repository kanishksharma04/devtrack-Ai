"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#151515",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#fafafa",
            borderRadius: "10px",
          },
        }}
      />
    </SessionProvider>
  );
}
