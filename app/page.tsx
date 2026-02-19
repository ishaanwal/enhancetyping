import Link from "next/link";
import { TypingTest } from "@/components/typing-test";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const HERO_DEMO_TEXT = "focus builds speed accuracy keeps your rhythm smooth and your confidence high each session";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect("/dashboard");
  }
  return (
    <div className="space-y-16">
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
            presetAuthor="EnhanceTyping"
            fixedDuration={30}
            hideControls
            disableSourceSwitch
          />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="review-card">
          <div className="mb-3 flex items-center gap-1 text-amber-300" aria-label="5 star review">
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg key={idx} viewBox="0 0 20 20" className="h-4 w-4 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">
                <path d="M10 1.7l2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.6-5 2.6.9-5.5-4-3.9 5.6-.8L10 1.7z" />
              </svg>
            ))}
          </div>
          <p className="text-sm">“My speed jumped 19 WPM in two weeks without sacrificing accuracy.”</p>
          <p className="mt-4 text-sm font-medium">Aarav S.</p>
          <p className="review-muted text-xs">CS Student</p>
        </article>
        <article className="review-card">
          <div className="mb-3 flex items-center gap-1 text-amber-300" aria-label="5 star review">
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg key={idx} viewBox="0 0 20 20" className="h-4 w-4 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">
                <path d="M10 1.7l2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.6-5 2.6.9-5.5-4-3.9 5.6-.8L10 1.7z" />
              </svg>
            ))}
          </div>
          <p className="text-sm">“The live feedback keeps me focused and makes every session feel useful.”</p>
          <p className="mt-4 text-sm font-medium">Mia R.</p>
          <p className="review-muted text-xs">Product Designer</p>
        </article>
        <article className="review-card">
          <div className="mb-3 flex items-center gap-1 text-amber-300" aria-label="5 star review">
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg key={idx} viewBox="0 0 20 20" className="h-4 w-4 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">
                <path d="M10 1.7l2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.6-5 2.6.9-5.5-4-3.9 5.6-.8L10 1.7z" />
              </svg>
            ))}
          </div>
          <p className="text-sm">“I finally understood why my speed stalled, then fixed it fast.”</p>
          <p className="mt-4 text-sm font-medium">Noah T.</p>
          <p className="review-muted text-xs">Operations Analyst</p>
        </article>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-cyan-950/45 p-6 shadow-xl shadow-cyan-950/15 dark:border-slate-700/70 dark:from-slate-900/90 dark:to-cyan-950/35">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Personalized tips that improve your typing</h2>
          <span className="badge border-cyan-400/35 bg-cyan-500/10 text-cyan-200">Actionable</span>
        </div>
        <p className="max-w-3xl text-sm text-slate-300">
          Example from a premium user: the platform turns raw scores into a simple plan with exactly what to practice, why it matters, and what improvement to expect next week.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/45 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Current profile</p>
            <p className="mt-2 text-3xl font-bold text-cyan-100">Intermediate Builder</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-slate-500">WPM</p>
                <p className="text-xl font-semibold text-slate-100">78.6</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Accuracy</p>
                <p className="text-xl font-semibold text-slate-100">95.9%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Consistency</p>
                <p className="text-xl font-semibold text-slate-100">87.4%</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-emerald-200">Trend: +9.8 WPM over 21 sessions</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/35 bg-cyan-500/10 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-100/90">Next 7-day plan</p>
            <ul className="mt-3 space-y-2 text-sm text-cyan-50/95">
              <li>1. 2 x 30s runs at 96-97% accuracy (control first).</li>
              <li>2. 3 x 60s runs focused on smooth rhythm, not max speed.</li>
              <li>3. 5-minute ASDF/JKL; drill to remove left-hand slips.</li>
            </ul>
            <p className="mt-4 text-sm font-medium text-cyan-100">Expected result: +4 to +6 WPM with fewer breakdowns.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/how-it-works" className="btn-secondary">
            How This Works
          </Link>
          <Link href="/practice" className="btn-primary">
            Try Personalized Practice
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <Link
          href="/pricing"
          className="group rounded-3xl border border-slate-800/80 bg-slate-900/45 p-8 shadow-lg shadow-black/15 transition hover:-translate-y-1 hover:border-slate-700"
        >
          <p className="text-sm uppercase tracking-wide text-slate-400">Free</p>
          <p className="mt-2 text-5xl font-bold tracking-tight">£0</p>
          <p className="mt-3 text-sm text-slate-400">Train daily with fast tests and public rankings.</p>
          <span className="mt-6 inline-flex text-sm font-medium text-cyan-200 group-hover:text-cyan-100">View details</span>
        </Link>
        <Link
          href="/pricing"
          className="group rounded-3xl border border-cyan-400/45 bg-gradient-to-b from-cyan-500/16 to-slate-900/55 p-8 shadow-xl shadow-cyan-950/30 transition hover:-translate-y-1"
        >
          <p className="text-sm uppercase tracking-wide text-cyan-100">Premium</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-cyan-100">£5.99/mo</p>
          <p className="mt-3 text-sm text-cyan-50/90">Unlock full analytics and guided improvement insights.</p>
          <span className="mt-6 inline-flex text-sm font-medium text-cyan-100 group-hover:text-white">See premium plan</span>
        </Link>
      </section>

      <div className="pb-2 text-center">
        <Link href="/pricing" className="btn-secondary">
          Compare full pricing
        </Link>
      </div>
    </div>
  );
}
