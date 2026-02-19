"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("enhancetyping-theme") ?? localStorage.getItem("typeforge-theme");
    setTheme(stored === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("enhancetyping-theme", next);
    localStorage.setItem("typeforge-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-300/90 bg-white px-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      <span className="pl-1">{theme === "dark" ? "Dark" : "Light"}</span>
      <span
        className={`relative h-5 w-10 rounded-full transition ${
          theme === "dark" ? "bg-cyan-500/80" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            theme === "dark" ? "left-[1.15rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
