"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("typeforge-theme");
    setTheme(stored === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("typeforge-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <button type="button" onClick={toggle} className="btn-secondary h-9 px-3">
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
