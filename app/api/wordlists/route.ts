import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(60),
  words: z.string().min(4).max(50000),
  isPublic: z.boolean().default(false)
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ lists: [] });
  }

  const lists = await prisma.wordList.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ lists });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!session.user.isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const created = await prisma.wordList.create({
    data: {
      userId: session.user.id,
      ...parsed.data
    }
  });

  return NextResponse.json({ list: created });
}
