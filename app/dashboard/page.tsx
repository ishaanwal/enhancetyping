import Link from "next/link";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { SAMPLE_ANALYTICS } from "@/lib/demo";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Band = "excellent" | "good" | "needs-work";

function bandForWpm(wpm: number): Band {
  if (wpm >= 85) return "excellent";
  if (wpm >= 60) return "good";
  return "needs-work";
}

function bandForAccuracy(accuracy: number): Band {
  if (accuracy >= 97) return "excellent";
  if (accuracy >= 93) return "good";
  return "needs-work";
}

function bandLabel(band: Band) {
  if (band === "excellent") return "Excellent";
  if (band === "good") return "Good";
  return "Needs Work";
}

function bandClasses(band: Band) {
  if (band === "excellent") return "border-emerald-400/40 bg-emerald-500/10 text-emerald-200";
  if (band === "good") return "border-cyan-400/40 bg-cyan-500/10 text-cyan-200";
  return "border-amber-400/40 bg-amber-500/10 text-amber-200";
}

function formatDelta(delta: number, suffix = "") {
  if (Math.abs(delta) < 0.05) return `0${suffix}`;
  return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}${suffix}`;
}

function trendClass(delta: number) {
  if (delta > 0) return "text-emerald-300";
  if (delta < 0) return "text-rose-300";
  return "text-slate-400";
}

function typingLevel(wpm: number, accuracy: number) {
  if (wpm >= 95 && accuracy >= 97) return "Elite";
  if (wpm >= 80 && accuracy >= 96) return "Advanced";
  if (wpm >= 60 && accuracy >= 94) return "Intermediate";
  return "Foundation";
}

function getConsecutiveDayStreak(days: string[]) {
  if (!days.length) return 0;

  const uniqueDays = Array.from(new Set(days)).sort((a, b) => (a < b ? 1 : -1));
  let streak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(`${uniqueDays[i - 1]}T00:00:00Z`).getTime();
    const curr = new Date(`${uniqueDays[i]}T00:00:00Z`).getTime();
    const diffDays = Math.round((prev - curr) / 86400000);
    if (diffDays === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function Sparkline({ values }: { values: number[] }) {
  if (!values.length) {
    return <div className="h-10 rounded-lg bg-slate-900/60" />;
  }

  const width = 220;
  const height = 44;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const points = values
    .map((value, idx) => {
      const x = (idx / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-11 w-full">
      <polyline fill="none" stroke="rgb(8 145 178)" strokeWidth="2.5" points={points} />
      <polyline fill="none" stroke="rgb(56 189 248 / 0.35)" strokeWidth="7" points={points} />
    </svg>
  );
}

function WpmChart({ values }: { values: number[] }) {
  if (!values.length) {
    return <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-sm text-slate-400">No data yet.</div>;
  }

  const width = 800;
  const height = 240;
  const pad = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const points = values
    .map((value, idx) => {
      const x = pad + (idx / Math.max(1, values.length - 1)) * (width - pad * 2);
      const y = height - pad - ((value - min) / range) * (height - pad * 2);
      return { x, y };
    });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-300/30 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-lg dark:shadow-cyan-950/20">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">WPM Over Time</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Last {values.length} sessions</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <polyline fill="rgb(34 211 238 / 0.15)" points={area} />
        <polyline fill="none" stroke="rgb(8 145 178)" strokeWidth="3" points={line} />
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill="rgb(6 182 212)" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-500">
        <span>Earlier</span>
        <span>Latest</span>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-400">Sign in to save results. You can still test as a guest on /test.</p>
        <div className="card p-5">
          <h2 className="font-semibold">Sample analytics</h2>
          <p className="mt-2 text-sm text-slate-300">Avg WPM {SAMPLE_ANALYTICS.averageWpm} • Accuracy {SAMPLE_ANALYTICS.avgAccuracy}%</p>
          <p className="mt-2 text-xs text-slate-400">This sample appears in demo mode for guests.</p>
          <Link href="/login" className="btn-primary mt-4">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const results = await prisma.typingResult.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 60
  });

  const recent = results.slice(0, 12);
  const hasRecent = recent.length > 0;
  const averageWpm = recent.length ? recent.reduce((acc, result) => acc + result.wpm, 0) / recent.length : 0;
  const averageAccuracy = recent.length ? recent.reduce((acc, result) => acc + result.accuracy, 0) / recent.length : 0;
  const previousBlock = results.slice(12, 24);
  const previousWpm = previousBlock.length
    ? previousBlock.reduce((acc, result) => acc + result.wpm, 0) / previousBlock.length
    : averageWpm;
  const previousAccuracy = previousBlock.length
    ? previousBlock.reduce((acc, result) => acc + result.accuracy, 0) / previousBlock.length
    : averageAccuracy;

  const wpmDelta = averageWpm - previousWpm;
  const accuracyDelta = averageAccuracy - previousAccuracy;
  const bestWpm = results.length ? Math.max(...results.map((r) => r.wpm)) : 0;
  const bestAccuracy = results.length ? Math.max(...results.map((r) => r.accuracy)) : 0;

  const dayKeys = results.map((item) => item.createdAt.toISOString().slice(0, 10));
  const streakDays = getConsecutiveDayStreak(dayKeys);

  const chartValues = [...recent].reverse().map((r) => Number(r.wpm.toFixed(1)));
  const sparklineValues = chartValues.slice(-8);

  const wpmBand = bandForWpm(averageWpm);
  const accuracyBand = bandForAccuracy(averageAccuracy);
  const avgErrors = recent.length ? recent.reduce((acc, result) => acc + result.errors, 0) / recent.length : 0;
  const avgConsistency = recent.length ? recent.reduce((acc, result) => acc + result.consistency, 0) / recent.length : 0;
  const level = hasRecent ? typingLevel(averageWpm, averageAccuracy) : "N/A";

  const coachingTip = !hasRecent
    ? "No saved sessions yet. Run 5 tests across 30s and 60s to unlock personalized coaching."
    : accuracyBand === "needs-work"
      ? "Your accuracy is limiting speed. Slow down for 2-3 sessions and target 96%+ accuracy first."
      : wpmBand === "needs-work"
        ? "Your speed is below your likely potential. Run 30s bursts with relaxed hands and smooth rhythm."
        : "You are in a strong zone. Focus on consistency to keep high scores repeatable.";

  const primaryBottleneck = !hasRecent
    ? "N/A"
    : averageAccuracy < 94.5
      ? "Accuracy control"
      : avgConsistency < 84
        ? "Rhythm consistency"
        : avgErrors > 5
          ? "Error frequency"
          : "Speed ceiling";

  const improvementPlan = hasRecent
    ? [
        averageAccuracy < 94.5
          ? "Do 4 short runs at 85-90% pace and hold 96%+ accuracy."
          : "Start with 2 warmup runs focusing on calm keypress timing.",
        avgConsistency < 84
          ? "Use 60s mode and keep cadence stable; avoid sprinting first 20 seconds."
          : "Run one 120s test daily to build stable endurance.",
        avgErrors > 5
          ? "Drill your most missed keys for 5 minutes before leaderboard attempts."
          : "Push one max-speed run at the end and compare against your baseline."
      ]
    : [
        "Run 3 tests in 30s mode to set your first speed baseline.",
        "Run 2 tests in 60s mode to measure endurance consistency.",
        "Return here to get tailored drills from your own results."
      ];

  const premiumHeatmap = SAMPLE_ANALYTICS.heatmap;
  const dashboardLocked = !session.user.isPremium;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Understand performance fast: speed, quality, trend, and what to improve next.</p>
        </div>
        <Link href="/test" className="btn-primary px-5 py-2.5 text-sm">
          Start Test
        </Link>
      </div>

      <div className="relative">
        <div className={dashboardLocked ? "pointer-events-none select-none blur-md opacity-55 brightness-75" : "space-y-6"}>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-300/30 dark:border-slate-700 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-lg dark:shadow-cyan-950/15">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average WPM</p>
              <div className="mt-1 flex items-end gap-2">
                <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">{hasRecent ? averageWpm.toFixed(1) : "N/A"}</p>
                <span className={`text-xs font-semibold ${trendClass(wpmDelta)}`}>{hasRecent ? formatDelta(wpmDelta) : "N/A"}</span>
              </div>
              <div className="mt-2"><Sparkline values={sparklineValues} /></div>
              <span className={`badge mt-2 ${bandClasses(wpmBand)}`}>{hasRecent ? bandLabel(wpmBand) : "N/A"}</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-300/30 dark:border-slate-700 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-lg dark:shadow-cyan-950/15">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average Accuracy</p>
              <div className="mt-1 flex items-end gap-2">
                <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">{hasRecent ? `${averageAccuracy.toFixed(1)}%` : "N/A"}</p>
                <span className={`text-xs font-semibold ${trendClass(accuracyDelta)}`}>{hasRecent ? formatDelta(accuracyDelta, "%") : "N/A"}</span>
              </div>
              <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">Best accuracy: {hasRecent ? `${bestAccuracy.toFixed(1)}%` : "N/A"}</p>
              <span className={`badge mt-2 ${bandClasses(accuracyBand)}`}>{hasRecent ? bandLabel(accuracyBand) : "N/A"}</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-300/30 dark:border-slate-700 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-lg dark:shadow-cyan-950/15">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Personal Best</p>
              <p className="mt-1 text-4xl font-bold text-slate-900 dark:text-slate-100">{hasRecent ? bestWpm.toFixed(1) : "N/A"}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Highest WPM recorded</p>
              <p className="mt-4 text-sm text-cyan-700 dark:text-cyan-200">Keep this as your benchmark target.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-300/30 dark:border-slate-700 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-lg dark:shadow-cyan-950/15">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Streak</p>
              <p className="mt-1 text-4xl font-bold text-slate-900 dark:text-slate-100">{hasRecent ? `${streakDays} days` : "N/A"}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Consecutive active days</p>
              <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-200">Consistency multiplies long-term speed gains.</p>
            </div>
          </div>

          <WpmChart values={chartValues} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-300/25 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Personalized Insights</h2>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{coachingTip}</p>
              </div>
              <span className="badge border-cyan-400/35 bg-cyan-500/10 text-cyan-200">Level: {level}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Metric title="Primary bottleneck" value={primaryBottleneck} />
              <Metric title="Speed score" value={hasRecent ? bandLabel(wpmBand) : "N/A"} />
              <Metric title="Quality score" value={hasRecent ? bandLabel(accuracyBand) : "N/A"} />
              <Metric title="Trend" value={hasRecent ? (wpmDelta >= 0 ? "Improving" : "Cooling down") : "N/A"} />
            </div>
            <div className="mt-4 rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-200">What to do next</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {improvementPlan.map((step) => (
                  <li key={step}>- {step}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                Current baseline: {hasRecent ? `${averageWpm.toFixed(1)} WPM, ${averageAccuracy.toFixed(1)}% accuracy, ${avgConsistency.toFixed(1)}% consistency` : "N/A"}.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-300/25 dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="mb-3 text-lg font-semibold">Recent Results</h2>
            {recent.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">No saved results yet. Start a test to build your trend.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-2 pr-2">Mode</th>
                      <th className="py-2 pr-2">WPM</th>
                      <th className="py-2 pr-2">Accuracy</th>
                      <th className="py-2 pr-2">Vs Previous</th>
                      <th className="py-2 pr-2">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((item, idx) => {
                      const prev = recent[idx + 1];
                      const delta = prev ? item.wpm - prev.wpm : 0;
                      return (
                        <tr key={item.id} className="border-b border-slate-900/70">
                          <td className="py-2 pr-2">{item.durationSeconds}s {item.textSource}</td>
                          <td className="py-2 pr-2 font-medium">{item.wpm.toFixed(1)}</td>
                          <td className="py-2 pr-2">{item.accuracy.toFixed(1)}%</td>
                          <td className={`py-2 pr-2 ${trendClass(delta)}`}>{idx === recent.length - 1 ? "-" : formatDelta(delta)}</td>
                          <td className="py-2 pr-2 text-slate-500 dark:text-slate-400">{item.createdAt.toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-300/25 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Premium Analytics Suite</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Deep insights for consistency, error reduction, and long-term speed growth.</p>
              </div>
              <span className={`badge ${dashboardLocked ? "border-amber-400/40 bg-amber-500/10 text-amber-200" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"}`}>
                {dashboardLocked ? "Preview" : "Unlocked"}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Panel title="Error Heatmap">
                {premiumHeatmap.map((row) => (
                  <div key={row.key} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{row.key.toUpperCase()}</span>
                    <span className="text-slate-600 dark:text-slate-300">{row.mistakes} mistakes</span>
                  </div>
                ))}
              </Panel>
              <Panel title="Consistency History">
                <div className="grid grid-cols-7 gap-1">
                  {SAMPLE_ANALYTICS.consistencyTrend.map((value, idx) => (
                    <div key={idx} className="rounded bg-cyan-500/15 p-2 text-center text-xs text-slate-700 dark:text-slate-200">
                      {value}%
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Goals & Streak Tools">
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>Target WPM milestones</li>
                  <li>Daily consistency goals</li>
                  <li>Streak reminder nudges</li>
                </ul>
              </Panel>
              <Panel title="Advanced Access">
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>Unlimited result history</li>
                  <li>CSV export</li>
                  <li>Friends leaderboard + follows</li>
                </ul>
              </Panel>
            </div>
          </section>
        </div>
        {dashboardLocked ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
            <div className="rounded-xl border border-cyan-400/40 bg-white/92 p-4 text-center shadow-lg shadow-cyan-900/20 dark:bg-slate-950/88">
              <p className="text-sm font-semibold">Unlock Premium Dashboard</p>
              <p className="mt-1 max-w-xs text-xs text-slate-600 dark:text-slate-400">Access full analytics, personalized training guidance, and detailed progress intelligence.</p>
              <Link href="/pricing" className="btn-primary mt-3">
                Upgrade to Premium
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/70">
      <p className="text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
