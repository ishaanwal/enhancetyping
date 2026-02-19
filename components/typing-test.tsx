"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";

type TextSource = "words" | "quote";
type SaveState = { status: "idle" | "saving" | "saved" | "error"; message?: string };
type ResultPayload = {
  mode: string;
  durationSeconds: number;
  textSource: TextSource;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  consistency: number;
  actualDurationSeconds: number;
  inputHistory: number[];
};

const DURATIONS = [15, 30, 60, 120] as const;

function countCorrect(text: string, input: string) {
  let correct = 0;
  let incorrect = 0;
  for (let i = 0; i < input.length; i++) {
    if (text[i] === input[i]) {
      correct += 1;
    } else {
      incorrect += 1;
    }
  }
  return { correct, incorrect };
}

type TypingTestProps = {
  compact?: boolean;
  presetText?: string;
  presetAuthor?: string | null;
  fixedDuration?: number;
  hideControls?: boolean;
  disableSourceSwitch?: boolean;
};

export function TypingTest({
  compact = false,
  presetText,
  presetAuthor = null,
  fixedDuration,
  hideControls = false,
  disableSourceSwitch = false
}: TypingTestProps) {
  const initialDuration = (fixedDuration && fixedDuration > 0 ? fixedDuration : 60) as (typeof DURATIONS)[number];
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(initialDuration);
  const [source, setSource] = useState<TextSource>("words");
  const [text, setText] = useState("");
  const [author, setAuthor] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [remaining, setRemaining] = useState(initialDuration);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [rawSeries, setRawSeries] = useState<number[]>([]);
  const [resultPayload, setResultPayload] = useState<ResultPayload | null>(null);
  const startRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const safeText = typeof text === "string" ? text : "";

  const elapsedSeconds = useMemo(() => {
    if (!startRef.current) return 0;
    return Math.min(duration, (Date.now() - startRef.current) / 1000);
  }, [duration, input, remaining]);

  const { correct, incorrect } = useMemo(() => countCorrect(text, input), [text, input]);
  const totalTyped = input.length;
  const accuracy = totalTyped === 0 ? 100 : (correct / totalTyped) * 100;
  const grossWpm = elapsedSeconds > 0 ? (totalTyped / 5 / elapsedSeconds) * 60 : 0;
  const netWpm = elapsedSeconds > 0 ? (correct / 5 / elapsedSeconds) * 60 : 0;
  const consistency = useMemo(() => {
    if (rawSeries.length < 2) return 100;
    const avg = rawSeries.reduce((acc, n) => acc + n, 0) / rawSeries.length;
    if (avg === 0) return 0;
    const variance = rawSeries.reduce((acc, n) => acc + Math.pow(n - avg, 2), 0) / rawSeries.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, 100 - (stdDev / avg) * 100);
  }, [rawSeries]);

  const reset = async () => {
    setInput("");
    setIsRunning(false);
    setHasFinished(false);
    setRemaining(duration);
    setRawSeries([]);
    setResultPayload(null);
    startRef.current = null;
    setSaveState({ status: "idle" });

    if (presetText) {
      setText(presetText);
      setAuthor(presetAuthor);
      requestAnimationFrame(() => textareaRef.current?.focus());
      return;
    }

    try {
      const response = await fetch(
        `/api/text/source?source=${source}&wordCount=${source === "words" ? 120 : 45}`,
        {
          cache: "no-store"
        }
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Failed to load text source");
      }

      if (json.source === "quote") {
        setText(typeof json.content === "string" ? json.content : "");
        setAuthor(typeof json.author === "string" ? json.author : null);
      } else {
        setText(typeof json.text === "string" ? json.text : "");
        setAuthor(null);
      }
    } catch {
      setText("typeforge demo mode keeps running even when text loading fails");
      setAuthor("TypeForge");
    }

    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  useEffect(() => {
    void reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, source, presetText, presetAuthor]);

  useEffect(() => {
    if (fixedDuration && fixedDuration > 0) {
      setDuration(fixedDuration as (typeof DURATIONS)[number]);
      setRemaining(fixedDuration);
    }
  }, [fixedDuration]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        void reset();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, source]);

  useEffect(() => {
    if (!isRunning || hasFinished) return;

    const interval = window.setInterval(() => {
      if (!startRef.current) return;
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, Math.ceil(duration - elapsed));
      setRemaining(left);

      const currentRaw = elapsed > 0 ? (input.length / 5 / elapsed) * 60 : 0;
      setRawSeries((prev) => [...prev.slice(-20), currentRaw]);

      if (elapsed >= duration) {
        window.clearInterval(interval);
        void finish();
      }
    }, 100);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, hasFinished, duration, input.length]);

  useEffect(() => {
    if (!isRunning || hasFinished) return;
    if (!safeText.length) return;

    // End early only when the entire prompt has been typed correctly.
    if (input.length >= safeText.length && input === safeText) {
      void finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, safeText, isRunning, hasFinished]);

  const finish = async () => {
    if (hasFinished) return;
    setHasFinished(true);
    setIsRunning(false);
    setRemaining(0);

    const payload: ResultPayload = {
      mode: "standard",
      durationSeconds: duration,
      textSource: source,
      wpm: Number(netWpm.toFixed(2)),
      rawWpm: Number(grossWpm.toFixed(2)),
      accuracy: Number(accuracy.toFixed(2)),
      errors: incorrect,
      correctChars: correct,
      incorrectChars: incorrect,
      totalChars: totalTyped,
      consistency: Number(consistency.toFixed(2)),
      actualDurationSeconds: Number(Math.max(1, elapsedSeconds).toFixed(2)),
      inputHistory: rawSeries
    };
    setResultPayload(payload);
    await saveResult(payload);
  };

  const saveResult = async (payload?: ResultPayload) => {
    const toSave = payload ?? resultPayload;
    if (!toSave || saveState.status === "saving") {
      return;
    }
    setSaveState({ status: "saving", message: "Validating score..." });
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave)
      });
      const json = await response.json();
      if (!response.ok) {
        setSaveState({ status: "error", message: json.error || "Could not save result." });
        return;
      }
      window.dispatchEvent(new CustomEvent("typing:result-saved"));
      setSaveState({ status: "saved", message: json.message || (json.saved ? "Result saved." : "Guest result validated.") });
    } catch {
      setSaveState({ status: "error", message: "Network error while saving." });
    }
  };

  const onInput = (value: string) => {
    if (hasFinished) return;
    if (!isRunning && value.length > 0) {
      startRef.current = Date.now();
      setIsRunning(true);
    }
    setInput(value.slice(0, safeText.length));
  };

  const startNow = () => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <section className="card p-4 md:p-6">
      <div className={clsx("mb-4 flex flex-wrap items-center gap-2 transition-opacity", isRunning && "opacity-75")}>
        {!hideControls ? (
          <>
            {DURATIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDuration(item)}
                className={clsx(
                  "btn-secondary h-8 px-3 text-xs",
                  duration === item && "border-cyan-300 bg-cyan-500/15 text-cyan-100 shadow-md shadow-cyan-900/40"
                )}
              >
                {item}s
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSource("words")}
              disabled={disableSourceSwitch}
              className={clsx(
                "btn-secondary h-8 px-3 text-xs",
                source === "words" && "border-cyan-300 bg-cyan-500/15 text-cyan-100 shadow-md shadow-cyan-900/40",
                disableSourceSwitch && "cursor-not-allowed opacity-60"
              )}
            >
              Words
            </button>
            <button
              type="button"
              onClick={() => setSource("quote")}
              disabled={disableSourceSwitch}
              className={clsx(
                "btn-secondary h-8 px-3 text-xs",
                source === "quote" && "border-cyan-300 bg-cyan-500/15 text-cyan-100 shadow-md shadow-cyan-900/40",
                disableSourceSwitch && "cursor-not-allowed opacity-60"
              )}
            >
              Quotes
            </button>
            <button type="button" onClick={() => void reset()} className="btn-secondary h-8 px-3 text-xs">
              Restart (Esc)
            </button>
          </>
        ) : (
          <span className="badge border-cyan-500/40 text-cyan-200">Fixed Demo • {duration}s</span>
        )}
      </div>

      <div
        className={clsx(
          "mb-4 grid gap-3 transition-opacity",
          compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-5",
          isRunning && "opacity-80"
        )}
      >
        <Stat label="Time" value={`${remaining}s`} active={isRunning} compact={compact} />
        <Stat label="WPM" value={netWpm.toFixed(1)} active={isRunning && netWpm > 0} highlight compact={compact} />
        <Stat label="Raw" value={grossWpm.toFixed(1)} active={isRunning && grossWpm > 0} compact={compact} />
        <Stat label="Accuracy" value={`${accuracy.toFixed(1)}%`} active={isRunning} compact={compact} />
        <Stat label="Consistency" value={`${consistency.toFixed(1)}%`} active={isRunning} compact={compact} />
      </div>

      {!isRunning && !hasFinished ? (
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <p>Click into the box and start typing. Timer starts on your first key.</p>
          <button type="button" className="btn-primary h-8 px-3 text-xs" onClick={startNow}>
            Start
          </button>
        </div>
      ) : null}

      <div className={clsx("rounded-xl border border-slate-700 bg-slate-950/75 p-4 text-lg leading-8 shadow-inner shadow-black/30 md:text-xl", compact && "text-base leading-7 md:text-lg", isRunning && "ring-1 ring-cyan-400/35")}>
        {safeText.split("").map((char, idx) => {
          const typed = input[idx];
          const isCurrent = idx === input.length;
          const isCorrect = typed && typed === char;
          const isWrong = typed && typed !== char;

          return (
            <span
              key={`${char}-${idx}`}
              className={clsx(
                "relative",
                isCorrect && "text-emerald-300",
                isWrong && "bg-red-500/30 text-red-200",
                !typed && "text-slate-400",
                isCurrent && "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-cyan-300"
              )}
            >
              {char}
            </span>
          );
        })}
      </div>

      {author ? <p className="mt-2 text-right text-xs text-slate-400">{author}</p> : null}

      <label htmlFor="typing-input" className="sr-only">
        Typing input
      </label>
      <textarea
        id="typing-input"
        ref={textareaRef}
        className={clsx(
          "mt-4 h-20 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 outline-none ring-cyan-400 transition-all focus:ring",
          isRunning && "border-cyan-500/45 bg-slate-950",
          !isRunning && !hasFinished && "ring-1 ring-cyan-400/35 animate-pulse"
        )}
        value={input}
        onChange={(event) => onInput(event.target.value)}
        placeholder={isRunning ? "Keep typing..." : "Click Start or type to begin..."}
        autoCorrect="off"
        spellCheck={false}
      />

      {hasFinished ? (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-300">Result summary</p>
          <p className="text-lg font-semibold">
            {netWpm.toFixed(1)} WPM • {accuracy.toFixed(1)}% accuracy • {incorrect} errors
          </p>
          <p className="mt-2 text-sm text-slate-400">{saveState.message || "Saving result automatically..."}</p>
        </div>
      ) : null}
    </section>
  );
}

function Stat({
  label,
  value,
  active = false,
  highlight = false,
  compact = false
}: {
  label: string;
  value: string;
  active?: boolean;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-800 bg-slate-900 p-3 transition-all duration-300",
        active && "border-slate-600",
        highlight && active && "border-cyan-400/45 bg-cyan-500/10 shadow-lg shadow-cyan-950/35"
      )}
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={clsx(
          "font-semibold text-slate-100 transition-all duration-300 tabular-nums",
          compact ? "text-xl leading-tight sm:text-[1.35rem]" : "text-2xl",
          active && "scale-[1.01]",
          highlight && active && "text-cyan-100"
        )}
      >
        {value}
      </p>
    </div>
  );
}
