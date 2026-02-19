import { subDays } from "date-fns";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  mode: z.string().default("standard"),
  duration: z.coerce.number().int().min(15).max(120).default(60),
  source: z.enum(["words", "quote"]).default("words"),
  window: z.enum(["daily", "weekly", "all"]).default("weekly"),
  scope: z.enum(["global", "friends"]).default("global")
});

function getWindowStart(window: "daily" | "weekly" | "all") {
  if (window === "daily") return subDays(new Date(), 1);
  if (window === "weekly") return subDays(new Date(), 7);
  return null;
}

function buildFallbackEntries(input: {
  duration: number;
  source: "words" | "quote";
  window: "daily" | "weekly" | "all";
  scope: "global" | "friends";
}) {
  const names =
    input.scope === "friends"
      ? ["Ava Friend", "Leo Friend", "Maya Friend", "Noah Friend", "Zara Friend", "Kai Friend", "Liam Friend", "Ivy Friend"]
      : ["RapidRaven", "KeySage", "SwiftMint", "NeonType", "PulsePilot", "ByteBlaze", "NovaKeys", "TurboTone", "DriftType", "AlphaRhythm"];

  const sourceOffset = input.source === "quote" ? -7 : 0;
  const windowOffset = input.window === "daily" ? 3 : input.window === "weekly" ? 1 : 0;
  const durationOffset = input.duration === 15 ? 6 : input.duration === 30 ? 3 : input.duration === 60 ? 0 : -2;
  const baseline = 88 + sourceOffset + windowOffset + durationOffset;

  return names.slice(0, 8).map((name, idx) => {
    const wpm = Math.max(48, baseline - idx * 2.8 + (idx % 2 === 0 ? 1.4 : -1.1));
    const accuracy = Math.min(99.6, 97.9 - idx * 0.45);
    const rawWpm = wpm + 5.2 - idx * 0.2;
    const consistency = Math.max(76, 95.5 - idx * 1.1);
    return {
      rank: idx + 1,
      name,
      wpm: Number(wpm.toFixed(1)),
      rawWpm: Number(rawWpm.toFixed(1)),
      accuracy: Number(accuracy.toFixed(1)),
      consistency: Number(consistency.toFixed(1)),
      errors: 1 + (idx % 4),
      createdAt: new Date(Date.now() - idx * 1000 * 60 * 45)
    };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = schema.safeParse({
    mode: searchParams.get("mode") ?? "standard",
    duration: searchParams.get("duration") ?? 60,
    source: searchParams.get("source") ?? "words",
    window: searchParams.get("window") ?? "weekly",
    scope: searchParams.get("scope") ?? "global"
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const query = parsed.data;
  const session = await getServerSession(authOptions);

  if (query.scope === "friends" && !session?.user?.id) {
    return NextResponse.json({ entries: [], message: "Sign in to view friends leaderboard." });
  }
  if (query.scope === "friends" && session?.user?.id && !session.user.isPremium) {
    return NextResponse.json({ entries: [], message: "Friends leaderboard is a premium feature." });
  }

  const windowStart = getWindowStart(query.window);
  const friendIds =
    query.scope === "friends" && session?.user?.id
      ? (
          await prisma.follow.findMany({
            where: { followerId: session.user.id },
            select: { followingId: true }
          })
        ).map((row) => row.followingId)
      : [];

  const rows = await prisma.typingResult.findMany({
    where: {
      mode: query.mode,
      durationSeconds: query.duration,
      textSource: query.source,
      isFlagged: false,
      ...(windowStart ? { createdAt: { gte: windowStart } } : {}),
      ...(query.scope === "friends"
        ? {
            userId: {
              in: session?.user?.id ? [...friendIds, session.user.id] : friendIds
            }
          }
        : {})
    },
    orderBy: [{ wpm: "desc" }, { accuracy: "desc" }, { createdAt: "asc" }],
    take: 500,
    select: {
      id: true,
      userId: true,
      displayName: true,
      wpm: true,
      rawWpm: true,
      accuracy: true,
      consistency: true,
      errors: true,
      createdAt: true,
      user: { select: { name: true, email: true } }
    }
  });

  const bestByIdentity = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const key = row.userId ?? `guest:${row.displayName ?? row.id}`;
    if (!bestByIdentity.has(key)) {
      bestByIdentity.set(key, row);
    }
  }

  const entries = Array.from(bestByIdentity.values())
    .slice(0, 100)
    .map((row, idx) => ({
      rank: idx + 1,
      name: row.displayName || row.user?.name || row.user?.email || "Anonymous",
      wpm: row.wpm,
      rawWpm: row.rawWpm,
      accuracy: row.accuracy,
      consistency: row.consistency,
      errors: row.errors,
      createdAt: row.createdAt
    }));

  if (entries.length > 0) {
    return NextResponse.json({ entries });
  }

  const fallbackEntries = buildFallbackEntries({
    duration: query.duration,
    source: query.source,
    window: query.window,
    scope: query.scope
  });
  return NextResponse.json({ entries: fallbackEntries, message: "Showing sample leaderboard data." });
}
