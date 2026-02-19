import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="text-3xl font-semibold tracking-tight">How EnhanceTyping Works</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          The platform is built to improve typing, not just measure it. Every test feeds into simple guidance: what your current
          level is, what is slowing you down, and exactly what to practice next.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-5">
          <p className="text-xs uppercase tracking-wide text-cyan-200">1. Measure</p>
          <h2 className="mt-2 text-lg font-semibold">Track key signals</h2>
          <p className="mt-2 text-sm text-slate-400">
            Each run captures WPM, raw speed, accuracy, errors, and consistency so your progress is measured from multiple angles.
          </p>
        </article>
        <article className="card p-5">
          <p className="text-xs uppercase tracking-wide text-cyan-200">2. Diagnose</p>
          <h2 className="mt-2 text-lg font-semibold">Find the bottleneck</h2>
          <p className="mt-2 text-sm text-slate-400">
            We identify whether your limit is speed, accuracy, rhythm, or error frequency so your training targets the real issue.
          </p>
        </article>
        <article className="card p-5">
          <p className="text-xs uppercase tracking-wide text-cyan-200">3. Improve</p>
          <h2 className="mt-2 text-lg font-semibold">Run tailored drills</h2>
          <p className="mt-2 text-sm text-slate-400">
            Premium adaptive practice recommends specific test durations and styles based on your latest results.
          </p>
        </article>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Progress levels in simple terms</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
            <p className="font-semibold">Foundation</p>
            <p className="mt-1 text-xs text-slate-400">Build control and reduce errors first.</p>
          </div>
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
            <p className="font-semibold">Intermediate</p>
            <p className="mt-1 text-xs text-slate-400">Stabilize rhythm and grow repeatable speed.</p>
          </div>
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
            <p className="font-semibold">Advanced</p>
            <p className="mt-1 text-xs text-slate-400">Increase ceiling while preserving high accuracy.</p>
          </div>
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
            <p className="font-semibold">Elite</p>
            <p className="mt-1 text-xs text-slate-400">Refine consistency under high-speed pressure.</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">How to use the platform</h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-300">
          <li>1. Start on `Test` and complete several runs across 30s and 60s.</li>
          <li>2. Open `Dashboard` to see trends and your current bottleneck.</li>
          <li>3. Use `Practice Lab` adaptive drills to target weak areas.</li>
          <li>4. Re-check leaderboard and dashboard weekly to confirm improvement.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/test" className="btn-primary">
            Start Typing Test
          </Link>
          <Link href="/practice" className="btn-secondary">
            Open Practice Lab
          </Link>
        </div>
      </section>
    </div>
  );
}
