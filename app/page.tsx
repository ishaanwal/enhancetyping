import Link from "next/link";
import { TypingTest } from "@/components/typing-test";
import { HOME_LEADERBOARD_PREVIEW, HOME_REVIEWS, PREMIUM_SNAPSHOT } from "@/data/home-showcase";

const HERO_DEMO_TEXT = "focus builds speed accuracy keeps your rhythm smooth and your confidence high each session";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="relative">
          <div className="pointer-events-none absolute -left-10 -top-14 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
          <p className="badge mb-3 border-cyan-400/30 text-cyan-200">Performance-first typing platform</p>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Build elite typing speed with clear, live feedback.
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-300 md:text-lg">
            Train fast, see what matters instantly, and improve with confidence every session.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/test" className="btn-primary px-6 py-3 text-base shadow-lg shadow-cyan-900/35">
              Start Typing Test
            </Link>
            <Link href="/pricing" className="btn-secondary">
              View Pricing
            </Link>
          </div>
        </div>
        <div className="card translate-y-0 p-5 shadow-xl shadow-black/35 transition-all duration-500 md:animate-[slideIn_.6s_ease-out]">
          <p className="mb-2 text-sm text-slate-300">Live demo widget</p>
          <p className="mb-3 text-xs text-slate-500">Fixed 30s starter run with a short prompt.</p>
          <TypingTest
            compact
            presetText={HERO_DEMO_TEXT}
            presetAuthor="TypeForge"
            fixedDuration={30}
            hideControls
            disableSourceSwitch
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">What Users Say</h2>
          <span className="badge border-slate-600 text-slate-300">Preview Reviews</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {HOME_REVIEWS.map((review) => (
            <article key={review.name} className="card p-5">
              <p className="text-sm text-slate-300">“{review.quote}”</p>
              <p className="mt-3 font-semibold">{review.name}</p>
              <p className="text-xs text-slate-400">{review.role}</p>
              <p className="mt-3 badge border-emerald-400/35 bg-emerald-500/10 text-emerald-200">{review.gain}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Leaderboard Snapshot</h2>
            <Link href="/leaderboard" className="text-sm text-cyan-300 hover:text-cyan-200">
              View full leaderboard
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">User</th>
                  <th className="py-2 pr-2">WPM</th>
                  <th className="py-2 pr-2">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {HOME_LEADERBOARD_PREVIEW.map((row) => (
                  <tr key={row.rank} className="border-b border-slate-900/70">
                    <td className="py-2 pr-2">{row.rank}</td>
                    <td className="py-2 pr-2">{row.name}</td>
                    <td className="py-2 pr-2 font-semibold text-cyan-200">{row.wpm.toFixed(1)}</td>
                    <td className="py-2 pr-2">{row.accuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Premium Analytics Snapshot</h2>
            <span className="badge border-cyan-400/35 bg-cyan-500/10 text-cyan-200">Premium</span>
          </div>
          <div className="space-y-3">
            {PREMIUM_SNAPSHOT.map((item) => (
              <div key={item.metric} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-semibold text-cyan-200">{item.metric}</p>
                <p className="mt-1 text-sm text-slate-300"><span className="text-slate-400">Shows you:</span> {item.insight}</p>
                <p className="mt-1 text-sm text-slate-300"><span className="text-slate-400">Lets you do:</span> {item.action}</p>
                <p className="mt-1 text-sm text-emerald-200"><span className="text-slate-400">Result:</span> {item.outcome}</p>
              </div>
            ))}
          </div>
          <Link href="/pricing" className="btn-primary mt-4">
            Unlock Premium Insights
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="badge border-slate-600 text-slate-300">01</p>
          <h2 className="mt-2 font-semibold">Fast Practice</h2>
          <p className="mt-1 text-sm text-slate-400">Modes, quotes, words, and real-time metrics.</p>
        </div>
        <div className="card p-5">
          <p className="badge border-slate-600 text-slate-300">02</p>
          <h2 className="mt-2 font-semibold">Fair Leaderboards</h2>
          <p className="mt-1 text-sm text-slate-400">Anti-cheat validation keeps rankings trustworthy.</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/35 bg-gradient-to-b from-cyan-500/12 to-slate-900 p-5 shadow-lg shadow-cyan-950/30">
          <p className="badge border-cyan-300/40 text-cyan-100">03</p>
          <h2 className="mt-2 font-semibold text-cyan-100">Premium Insights</h2>
          <p className="mt-1 text-sm text-cyan-50/90">Trends, heatmaps, goals, and friend competition.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Pricing</h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 opacity-80">
              <p className="text-sm text-slate-400">Free</p>
              <p className="mt-1 text-2xl font-semibold">£0</p>
              <p className="mt-2 text-sm text-slate-300">Unlimited tests, live session stats, and global leaderboard read access.</p>
            </div>
            <div className="rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-sky-500/15 p-4 shadow-lg shadow-cyan-950/30">
              <p className="text-sm text-cyan-100">Premium</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-100">£5.99/mo or £49.99/yr</p>
              <p className="mt-2 text-sm text-cyan-50/90">Includes advanced analytics, CSV export, custom lists, streaks, and friend leaderboard.</p>
            </div>
          </div>
          <Link href="/pricing" className="btn-primary mt-4">
            Compare Plans
          </Link>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Why This Matters</h2>
          <p className="mt-3 text-sm text-slate-300">
            Raw speed alone hides bad habits. Consistent progress comes from balancing speed with accuracy and smooth pacing.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><span className="text-slate-200">WPM:</span> your final effective speed.</li>
            <li><span className="text-slate-200">Raw WPM:</span> uncapped speed before error penalties.</li>
            <li><span className="text-slate-200">Accuracy:</span> correctness rate; this predicts sustainable speed.</li>
            <li><span className="text-slate-200">Consistency:</span> rhythm stability across the test.</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Read these together, not individually, to understand whether your current gains are real or noisy.
          </p>
        </div>
      </section>
    </div>
  );
}
