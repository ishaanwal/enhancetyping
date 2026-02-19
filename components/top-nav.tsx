"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/test", label: "Test" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" }
];

export function TopNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-cyan-700 dark:text-cyan-300">
            TypeForge
          </Link>
          <nav className="hidden items-center gap-3 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                  pathname === item.href && "nav-link-active"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
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
            <>
              <Link href="/login" className="btn-secondary h-9 px-3">
                Login
              </Link>
              <Link href="/signup" className="btn-primary h-9 px-3">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
