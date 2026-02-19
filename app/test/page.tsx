import { TypingTest } from "@/components/typing-test";

export default function TestPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Typing Test</h1>
          <p className="mt-1 text-sm text-slate-400">Focus on accuracy first, then lift speed while keeping rhythm steady.</p>
        </div>
        <span className="badge border-cyan-400/40 text-cyan-200">Esc to restart instantly</span>
      </div>
      <TypingTest />
    </div>
  );
}
