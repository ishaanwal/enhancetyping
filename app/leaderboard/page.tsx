import { getServerSession } from "next-auth";
import { LeaderboardClient } from "@/components/leaderboard-client";
import { authOptions } from "@/lib/auth";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="text-sm text-slate-400">Compare your pace against global and friends brackets. Click column headers to sort.</p>
      <LeaderboardClient canViewFriends={Boolean(session?.user?.id && session.user.isPremium)} />
    </div>
  );
}
