import { getServerSession } from "next-auth";
import Link from "next/link";
import { SAMPLE_ANALYTICS } from "@/lib/demo";
import { authOptions } from "@/lib/auth";

export default async function PracticePage() {
  const session = await getServerSession(authOptions);
  const premium = Boolean(session?.user?.isPremium);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">Practice Lab</h1>
      <section className="card p-5">
        <h2 className="text-lg font-semibold">Premium Practice Features</h2>
        <p className="mt-1 text-sm text-slate-400">Custom lesson plans, goals, and progression controls.</p>

        <div className="relative mt-4">
          <div className={premium ? "" : "pointer-events-none select-none blur-[2px] opacity-75"}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                <h3 className="font-semibold">Custom Lessons</h3>
                <p className="mt-1 text-sm text-slate-400">Upload your own word lists and build focused drills.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                <h3 className="font-semibold">Goal Tracking</h3>
                <p className="mt-1 text-sm text-slate-400">Target WPM, accuracy, and weekly session count.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                <h3 className="font-semibold">Streak Engine</h3>
                <p className="mt-1 text-sm text-slate-400">Current sample streak: {SAMPLE_ANALYTICS.streakDays} days.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4">
                <h3 className="font-semibold">Session Planning</h3>
                <p className="mt-1 text-sm text-slate-400">Weekly sample cadence: {SAMPLE_ANALYTICS.sessionsThisWeek} sessions.</p>
              </div>
            </div>
          </div>

          {!premium ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl border border-cyan-400/40 bg-white/92 p-4 text-center shadow-lg shadow-cyan-900/20 dark:bg-slate-950/88">
                <p className="text-sm font-semibold">Unlock Premium Practice Tools</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Get custom lessons, goals, streak engine, and planning tools.</p>
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
