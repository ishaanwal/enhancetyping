import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TypingTest } from "@/components/typing-test";

type Drill = {
  title: string;
  objective: string;
  duration: 15 | 30 | 60 | 120;
  text: string;
  why: string;
};

function levelFromMetrics(wpm: number, accuracy: number) {
  if (wpm >= 95 && accuracy >= 97) return "Elite";
  if (wpm >= 80 && accuracy >= 96) return "Advanced";
  if (wpm >= 60 && accuracy >= 94) return "Intermediate";
  return "Foundation";
}

function buildDrills(avgWpm: number, avgAccuracy: number, avgConsistency: number, avgErrors: number): Drill[] {
  const accuracyFocus = avgAccuracy < 95;
  const rhythmFocus = avgConsistency < 85;
  const errorFocus = avgErrors > 5;

  const drills: Drill[] = [];
  drills.push({
    title: "Control Warmup",
    objective: accuracyFocus ? "Raise accuracy before speed pushes" : "Stabilize clean keypress rhythm",
    duration: 30,
    text: "clean typing builds speed only when every key press stays accurate and controlled",
    why: accuracyFocus
      ? "Your recent runs show avoidable misses. Cleaner starts lift net WPM fastest."
      : "Warm starts keep your later high-speed runs stable."
  });

  drills.push({
    title: "Rhythm Builder",
    objective: rhythmFocus ? "Reduce pacing drop-offs in longer runs" : "Maintain smooth cadence under pressure",
    duration: 60,
    text: "steady rhythm prevents late test breakdowns and helps speed remain repeatable over time",
    why: rhythmFocus
      ? "Consistency dipped in recent sessions. This builds controlled endurance."
      : "Your rhythm is good; this keeps performance reliable."
  });

  drills.push({
    title: "Error Reset Sprint",
    objective: errorFocus ? "Cut repeated mistakes while keeping momentum" : "Push speed ceiling with minimal penalties",
    duration: 15,
    text: "fast does not mean frantic breathe keep form and strike each key with intent",
    why: errorFocus
      ? "Higher error volume is slowing your effective speed."
      : "Short controlled sprints unlock peak speed safely."
  });

  return drills;
}

export default async function PracticePage() {
  const session = await getServerSession(authOptions);
  const premium = Boolean(session?.user?.isPremium);
  const userId = session?.user?.id;

  const recent = userId
    ? await prisma.typingResult.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 36
      })
    : [];
  const hasRecent = recent.length > 0;

  const avgWpm = recent.length ? recent.reduce((sum, r) => sum + r.wpm, 0) / recent.length : 72;
  const avgAccuracy = recent.length ? recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length : 95.4;
  const avgConsistency = recent.length ? recent.reduce((sum, r) => sum + r.consistency, 0) / recent.length : 86.5;
  const avgErrors = recent.length ? recent.reduce((sum, r) => sum + r.errors, 0) / recent.length : 4.2;
  const level = hasRecent ? levelFromMetrics(avgWpm, avgAccuracy) : "N/A";
  const drills = buildDrills(avgWpm, avgAccuracy, avgConsistency, avgErrors);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Practice Lab</h1>
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Adaptive Practice Plan</h2>
            <p className="mt-1 text-sm text-slate-400">
              Personalized tests adjust to your level and recent weak spots so each session improves the right thing.
            </p>
          </div>
          <span className="badge border-cyan-400/35 bg-cyan-500/10 text-cyan-200">Current level: {level}</span>
        </div>

        <div className="relative mt-4">
          <div className={premium ? "" : "pointer-events-none select-none blur-md opacity-55 brightness-75"}>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Speed baseline</p>
                <p className="mt-1 text-2xl font-semibold">{hasRecent ? `${avgWpm.toFixed(1)} WPM` : "N/A"}</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Accuracy baseline</p>
                <p className="mt-1 text-2xl font-semibold">{hasRecent ? `${avgAccuracy.toFixed(1)}%` : "N/A"}</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Consistency baseline</p>
                <p className="mt-1 text-2xl font-semibold">{hasRecent ? `${avgConsistency.toFixed(1)}%` : "N/A"}</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Primary target</p>
                <p className="mt-1 text-base font-semibold">{drills[0]?.title ?? "N/A"}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {drills.map((drill) => (
                <div key={drill.title} className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                  <h3 className="font-semibold">{drill.title}</h3>
                  <p className="mt-1 text-xs text-cyan-200">{drill.duration}s test</p>
                  <p className="mt-2 text-sm text-slate-300">{drill.objective}</p>
                  <p className="mt-2 text-xs text-slate-400">{drill.why}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
              <h3 className="text-base font-semibold">Start Your Recommended Drill</h3>
              <p className="mt-1 text-sm text-slate-300">
                This test is generated from your recent results and targets your current bottleneck.
              </p>
              <div className="mt-2">
                <TypingTest
                  compact
                  presetText={drills[0]?.text}
                  presetAuthor="Adaptive Drill"
                  fixedDuration={drills[0]?.duration}
                  hideControls
                  disableSourceSwitch
                />
              </div>
            </div>
          </div>

          {!premium ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
              <div className="rounded-xl border border-cyan-400/40 bg-white/92 p-4 text-center shadow-lg shadow-cyan-900/20 dark:bg-slate-950/88">
                <p className="text-sm font-semibold">Unlock Personalized Practice</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Get adaptive tests based on your results, with clear step-by-step guidance to improve faster.
                </p>
                <Link href="/pricing" className="btn-primary mt-3">
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
