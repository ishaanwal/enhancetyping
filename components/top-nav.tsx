"use client";

import Link from "next/link";
import clsx from "clsx";
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
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap px-1">
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
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link href="/profile" className="btn-secondary h-9 px-3">
                Profile
              </Link>
              <button className="btn-primary h-9 px-3" onClick={() => signOut({ callbackUrl: "/" })}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary h-9 px-4">
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
