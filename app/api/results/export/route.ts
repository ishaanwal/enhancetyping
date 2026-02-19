import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isPremium) {
    return new Response("Premium required", { status: 403 });
  }

  const results = await prisma.typingResult.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" }
  });

  const header = [
    "id",
    "createdAt",
    "mode",
    "durationSeconds",
    "textSource",
    "wpm",
    "rawWpm",
    "accuracy",
    "errors",
    "consistency"
  ];

  const rows = results.map((r) =>
    [
      r.id,
      r.createdAt.toISOString(),
      r.mode,
      r.durationSeconds,
      r.textSource,
      r.wpm,
      r.rawWpm,
      r.accuracy,
      r.errors,
      r.consistency
    ].join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=typeforge-results.csv"
    }
  });
}
