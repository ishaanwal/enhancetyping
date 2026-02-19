"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";

type Entry = {
  rank: number;
  name: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  errors: number;
  createdAt: string;
};

type SortKey = "rank" | "wpm" | "rawWpm" | "accuracy" | "consistency";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LeaderboardClient({ canViewFriends }: { canViewFriends: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [duration, setDuration] = useState(60);
  const [source, setSource] = useState<"words" | "quote">("words");
  const [windowRange, setWindowRange] = useState<"daily" | "weekly" | "all">("weekly");
  const [scope, setScope] = useState<"global" | "friends">("global");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchBoard = async () => {
    setLoading(true);
    const response = await fetch(
      `/api/leaderboard?mode=standard&duration=${duration}&source=${source}&window=${windowRange}&scope=${scope}`,
      { cache: "no-store" }
    );
    const json = await response.json();
    setEntries(json.entries || []);
    setMessage(json.message || "");
    setLoading(false);
  };

  useEffect(() => {
    void fetchBoard();
  }, [duration, source, windowRange, scope]);

  useEffect(() => {
    const onSaved = () => {
      void fetchBoard();
    };
    window.addEventListener("typing:result-saved", onSaved);
    return () => window.removeEventListener("typing:result-saved", onSaved);
  }, [duration, source, windowRange, scope]);

  const sortedEntries = useMemo(() => {
    const list = [...entries];
    list.sort((a, b) => {
      const aa = a[sortKey];
      const bb = b[sortKey];
      if (aa === bb) return 0;
      if (sortDir === "asc") return aa < bb ? -1 : 1;
      return aa > bb ? -1 : 1;
    });
    return list;
  }, [entries, sortDir, sortKey]);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "rank" ? "asc" : "desc");
  };

  return (
    <section className="card p-4 md:p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{scope === "global" ? "Global Leaderboard" : "Friends Leaderboard"}</h2>
        <span className="badge border-cyan-400/35 text-cyan-200">Mode: {duration}s {source}</span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[15, 30, 60, 120].map((v) => (
          <button
            key={v}
            onClick={() => setDuration(v)}
            className={clsx("btn-secondary h-8 px-3 text-xs", duration === v && "border-cyan-300 bg-cyan-500/10 text-cyan-100")}
          >
            {v}s
          </button>
        ))}
        <button
          onClick={() => setSource("words")}
          className={clsx("btn-secondary h-8 px-3 text-xs", source === "words" && "border-cyan-300 bg-cyan-500/10 text-cyan-100")}
        >
          Words
        </button>
        <button
          onClick={() => setSource("quote")}
          className={clsx("btn-secondary h-8 px-3 text-xs", source === "quote" && "border-cyan-300 bg-cyan-500/10 text-cyan-100")}
        >
          Quotes
        </button>
        <button
          onClick={() => setWindowRange("daily")}
          className={clsx("btn-secondary h-8 px-3 text-xs", windowRange === "daily" && "border-cyan-300 bg-cyan-500/10 text-cyan-100")}
        >
          Daily
        </button>
        <button
          onClick={() => setWindowRange("weekly")}
          className={clsx("btn-secondary h-8 px-3 text-xs", windowRange === "weekly" && "border-cyan-300 bg-cyan-500/10 text-cyan-100")}
        >
          Weekly
        </button>
        <button
          onClick={() => setWindowRange("all")}
          className={clsx("btn-secondary h-8 px-3 text-xs", windowRange === "all" && "border-cyan-300 bg-cyan-500/10 text-cyan-100")}
        >
          All-time
        </button>
        <button
          onClick={() => setScope("global")}
          className={clsx("btn-secondary h-8 px-3 text-xs", scope === "global" && "border-cyan-300 bg-cyan-500/10 text-cyan-100")}
        >
          Global
        </button>
        <button
          onClick={() => setScope("friends")}
          disabled={!canViewFriends}
          className={clsx(
            "btn-secondary h-8 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50",
            scope === "friends" && "border-cyan-300 bg-cyan-500/10 text-cyan-100"
          )}
        >
          Friends
        </button>
      </div>

      {message ? <p className="mb-3 text-sm text-slate-400">{message}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2 pr-2">
                <button className="hover:text-slate-200" onClick={() => setSort("rank")}>#</button>
              </th>
              <th className="py-2 pr-2">User</th>
              <th className="py-2 pr-2">
                <button className="hover:text-slate-200" onClick={() => setSort("wpm")}>WPM</button>
              </th>
              <th className="py-2 pr-2">
                <button className="hover:text-slate-200" onClick={() => setSort("rawWpm")}>Raw</button>
              </th>
              <th className="py-2 pr-2">
                <button className="hover:text-slate-200" onClick={() => setSort("accuracy")}>Accuracy</button>
              </th>
              <th className="py-2 pr-2">
                <button className="hover:text-slate-200" onClick={() => setSort("consistency")}>Consistency</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4" colSpan={6}>
                  Loading leaderboard...
                </td>
              </tr>
            ) : sortedEntries.length ? (
              sortedEntries.map((entry) => (
                <tr
                  key={`${entry.name}-${entry.rank}`}
                  className={clsx(
                    "border-b border-slate-900 text-slate-200 transition-colors hover:bg-slate-900/55",
                    entry.rank === 1 && "bg-amber-500/10",
                    entry.rank === 2 && "bg-slate-200/5",
                    entry.rank === 3 && "bg-orange-500/10"
                  )}
                >
                  <td className="py-2 pr-2 font-medium">{entry.rank}</td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-xs">
                        {initialsOf(entry.name)}
                      </span>
                      <span>{entry.name}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-2 font-semibold text-cyan-100">{entry.wpm.toFixed(1)}</td>
                  <td className="py-2 pr-2">{entry.rawWpm.toFixed(1)}</td>
                  <td className="py-2 pr-2">{entry.accuracy.toFixed(1)}%</td>
                  <td className="py-2 pr-2">{entry.consistency.toFixed(1)}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4" colSpan={6}>
                  No scores yet for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
