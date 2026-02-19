import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const flagSchema = z.object({
  resultId: z.string().cuid(),
  reason: z.string().min(4).max(240),
  remove: z.boolean().optional().default(false)
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || !env.adminEmails.includes(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = flagSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { resultId, reason, remove } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.adminFlag.create({
      data: { resultId, reason }
    });

    if (remove) {
      await tx.typingResult.delete({ where: { id: resultId } });
    } else {
      await tx.typingResult.update({ where: { id: resultId }, data: { isFlagged: true } });
    }
  });

  return NextResponse.json({ ok: true });
}
