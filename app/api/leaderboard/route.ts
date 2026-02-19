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

  return NextResponse.json({ entries });
}
