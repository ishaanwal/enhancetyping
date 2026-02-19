"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

function ThemeBootstrap() {
  useEffect(() => {
    const stored = localStorage.getItem("enhancetyping-theme") ?? localStorage.getItem("typeforge-theme");
    const theme = stored === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeBootstrap />
      {children}
    </SessionProvider>
  );
}
