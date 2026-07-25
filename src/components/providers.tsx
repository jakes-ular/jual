"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#0d0f16",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f4f4f6",
          },
        }}
      />
    </SessionProvider>
  );
}
