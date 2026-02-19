import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  userId: z.string().cuid()
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isPremium) {
    return NextResponse.json({ error: "Premium and sign in required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: parsed.data.userId
      }
    },
    update: {},
    create: {
      followerId: session.user.id,
      followingId: parsed.data.userId
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isPremium) {
    return NextResponse.json({ error: "Premium and sign in required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: parsed.data.userId
    }
  });

  return NextResponse.json({ ok: true });
}
