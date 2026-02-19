import { Prisma, TextSource } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { DURATIONS } from "@/lib/typing";

const resultSchema = z.object({
  mode: z.string().min(2).max(30),
  durationSeconds: z.number().int().refine((v) => DURATIONS.includes(v as (typeof DURATIONS)[number])),
  textSource: z.nativeEnum(TextSource),
  wpm: z.number().min(0).max(500),
  rawWpm: z.number().min(0).max(600),
  accuracy: z.number().min(0).max(100),
  errors: z.number().int().min(0).max(9999),
  correctChars: z.number().int().min(0).max(50000),
  incorrectChars: z.number().int().min(0).max(50000),
  totalChars: z.number().int().min(1).max(100000),
  consistency: z.number().min(0).max(100),
  actualDurationSeconds: z.number().min(1).max(180).optional(),
  inputHistory: z.unknown().optional()
});

function validateResult(payload: z.infer<typeof resultSchema>) {
  if (payload.accuracy < env.antiCheat.minAccuracy) {
    return `Accuracy below ${env.antiCheat.minAccuracy}%`;
  }
  if (payload.wpm > env.antiCheat.maxWpm) {
    return `WPM above allowed threshold (${env.antiCheat.maxWpm})`;
  }
  const durationForValidation = Math.min(
    payload.durationSeconds,
    Math.max(1, payload.actualDurationSeconds ?? payload.durationSeconds)
  );
  const expectedChars = (payload.wpm * 5 * durationForValidation) / 60;
  if (Math.abs(expectedChars - payload.totalChars) > Math.max(40, expectedChars * 0.4)) {
    return "Duration and character count mismatch";
  }
  if (payload.correctChars + payload.incorrectChars !== payload.totalChars) {
    return "Character totals do not add up";
  }
  if (payload.rawWpm + 35 < payload.wpm) {
    return "Raw WPM cannot be significantly below final WPM";
  }
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ results: [] });
  }

  const results = await prisma.typingResult.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({ results });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = resultSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid result payload" }, { status: 400 });
  }

  const violation = validateResult(parsed.data);
  if (violation) {
    return NextResponse.json({ error: `Rejected by anti-cheat: ${violation}` }, { status: 422 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({
      ok: true,
      saved: false,
      message: "Guest result validated but not saved. Sign up or use demo login to save history."
    });
  }

  const { actualDurationSeconds: _actualDurationSeconds, ...dataToStore } = parsed.data;
  const { inputHistory, ...rest } = dataToStore;

  const created = await prisma.typingResult.create({
    data: {
      userId: session.user.id,
      displayName: session.user.name || session.user.email || "EnhanceTyping User",
      ...rest,
      inputHistory: (inputHistory ?? Prisma.JsonNull) as Prisma.InputJsonValue
    }
  });

  return NextResponse.json({ ok: true, saved: true, result: created });
}
