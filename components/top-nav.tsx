"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

const baseNavLinks: Array<{ href: Route; label: string }> = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/test", label: "Test" },
  { href: "/practice", label: "Practice" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/pricing", label: "Pricing" }
];

export function TopNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks: Array<{ href: Route; label: string }> = session?.user
    ? [{ href: "/dashboard", label: "Dashboard" }, ...baseNavLinks]
    : baseNavLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="container-shell flex h-16 items-center gap-3">
        <div className="shrink-0">
          <Link href="/" className="text-lg font-semibold text-cyan-700 dark:text-cyan-300">
            EnhanceTyping
          </Link>
        </div>
        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap px-1 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-lg px-2 py-1 text-xs text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white md:text-sm",
                pathname === item.href && "nav-link-active"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          {session?.user ? (
            <>
              <Link href="/profile" className="btn-secondary hidden h-9 px-3 md:inline-flex">
                Profile
              </Link>
              <button className="btn-primary hidden h-9 px-3 md:inline-flex" onClick={() => signOut({ callbackUrl: "/" })}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary hidden h-9 px-4 md:inline-flex">
              Login / Sign Up
            </Link>
          )}
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[84%] max-w-xs border-l border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-cyan-700 dark:text-cyan-300">Menu</p>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                onClick={() => setMenuOpen(false)}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    "block rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200",
                    pathname === item.href && "nav-link-active"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              {session?.user ? (
                <div className="space-y-2">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="btn-secondary w-full">
                    Profile
                  </Link>
                  <button
                    className="btn-primary w-full"
                    onClick={() => {
                      setMenuOpen(false);
                      void signOut({ callbackUrl: "/" });
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary w-full">
                  Login / Sign Up
                </Link>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
