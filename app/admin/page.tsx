import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase() || "";

  if (!email || !env.adminEmails.includes(email)) {
    return <div className="card p-5">Access denied. Add your email to ADMIN_EMAILS to use admin tools.</div>;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      isPremium: true,
      _count: { select: { results: true } }
    }
  });

  const recentResults = await prisma.typingResult.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      displayName: true,
      wpm: true,
      accuracy: true,
      isFlagged: true
    }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="card p-5">
        <h2 className="font-semibold">Users</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 text-left">Email</th>
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Premium</th>
                <th className="py-2 text-left">Results</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-900">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.name}</td>
                  <td className="py-2">{user.isPremium ? "Yes" : "No"}</td>
                  <td className="py-2">{user._count.results}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Recent Results</h2>
        <p className="mt-2 text-sm text-slate-400">Use /api/admin/flags to flag or remove suspicious scores.</p>
        <div className="mt-3 space-y-2 text-sm">
          {recentResults.map((result) => (
            <div key={result.id} className="rounded-lg border border-slate-800 p-2">
              <p>
                {result.displayName || "Anonymous"}: {result.wpm.toFixed(1)} WPM at {result.accuracy.toFixed(1)}% accuracy
              </p>
              <p className="text-xs text-slate-400">{result.isFlagged ? "Flagged" : "Clean"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
