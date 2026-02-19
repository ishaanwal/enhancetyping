"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

export function PricingPlans({ stripeConfigured }: { stripeConfigured: boolean }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const premiumPrice = billingCycle === "monthly" ? "£5.99" : "£49.99";
  const premiumSuffix = billingCycle === "monthly" ? "/month" : "/year";

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900/70 p-1">
        <button
          type="button"
          className={clsx("rounded-lg px-4 py-2 text-sm transition", billingCycle === "monthly" ? "bg-cyan-500 text-slate-950" : "text-slate-300")}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={clsx("rounded-lg px-4 py-2 text-sm transition", billingCycle === "yearly" ? "bg-cyan-500 text-slate-950" : "text-slate-300")}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly (Best Value)
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="card p-6">
          <p className="text-sm text-slate-400">Free</p>
          <p className="mt-1 text-3xl font-bold">£0</p>
          <p className="mt-1 text-sm text-slate-400">Forever</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>✓ Unlimited typing tests</li>
            <li>✓ Live WPM and accuracy</li>
            <li>✓ Public leaderboard view</li>
            <li>✓ Guest test mode</li>
          </ul>
          <Link href="/test" className="btn-secondary mt-5 w-full">
            Start Free
          </Link>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-cyan-500/15 to-slate-950 p-6 shadow-xl shadow-cyan-950/30">
          <span className="badge border-cyan-300/60 bg-cyan-400/20 text-cyan-100">Most Popular</span>
          <p className="mt-3 text-sm text-cyan-100">Premium</p>
          <p className="mt-1 text-3xl font-bold text-cyan-100">{premiumPrice}</p>
          <p className="mt-1 text-sm text-cyan-50/90">{premiumSuffix}</p>
          <ul className="mt-4 space-y-2 text-sm text-cyan-50/90">
            <li>✓ Advanced trend analytics</li>
            <li>✓ Error heatmaps + consistency history</li>
            <li>✓ CSV export and full history</li>
            <li>✓ Custom word lists and goals</li>
            <li>✓ Friends leaderboard + follows</li>
          </ul>
          {stripeConfigured ? (
            <Link href="/profile" className="btn-primary mt-5 w-full">
              Get Premium
            </Link>
          ) : (
            <Link href="/profile" className="btn-primary mt-5 w-full">
              Unlock Premium in Profile
            </Link>
          )}
        </article>
      </div>

      <div className="card p-5">
        <h3 className="text-base font-semibold">Plan Comparison</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-2">Feature</th>
                <th className="py-2 pr-2">Free</th>
                <th className="py-2 pr-2">Premium</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Typing Tests", "Unlimited", "Unlimited"],
                ["Leaderboard", "Global read-only", "Global + Friends"],
                ["History", "Basic", "Unlimited + export"],
                ["Analytics", "Session only", "Advanced trends + heatmaps"],
                ["Goals / Streaks", "-", "Included"]
              ].map((row) => (
                <tr key={row[0]} className="border-b border-slate-900/70">
                  <td className="py-2 pr-2 text-slate-200">{row[0]}</td>
                  <td className="py-2 pr-2 text-slate-400">{row[1]}</td>
                  <td className="py-2 pr-2 text-cyan-100">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
