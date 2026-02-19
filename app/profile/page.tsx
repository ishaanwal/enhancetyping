import { getServerSession } from "next-auth";
import Link from "next/link";
import { BillingActions } from "@/components/billing-actions";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="card p-5">
        <p>You are not signed in.</p>
        <Link href="/login" className="btn-primary mt-3">
          Login
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      image: true,
      isPremium: true,
      subscriptionStatus: true,
      stripeCurrentPeriodEnd: true
    }
  });

  const displayName = user?.name || session.user.name || "EnhanceTyping User";
  const displayEmail = user?.email || session.user.email || "unknown@enhancetyping.local";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const renewalDate = user?.stripeCurrentPeriodEnd
    ? user.stripeCurrentPeriodEnd.toLocaleDateString()
    : user?.isPremium
      ? "N/A (demo premium)"
      : "Not subscribed";
  const nextCharge = user?.isPremium ? "£5.99 / month" : "£0";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      {!env.stripe.configured ? (
        <div className="soft-alert">
          <p className="font-medium">Demo mode billing alert</p>
          <p className="mt-1 text-xs text-amber-100/90">
            Billing provider is not configured. You can still explore all premium UI states.
          </p>
        </div>
      ) : null}

      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={displayName} className="h-16 w-16 rounded-2xl border border-slate-700 object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-500/10 text-lg font-semibold text-cyan-200">
              {initials}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Account</p>
            <p className="text-2xl font-semibold">{displayName}</p>
            <p className="text-base text-slate-200">{displayEmail}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="metric-card">
            <p className="text-xs uppercase tracking-wide text-slate-400">Current Plan</p>
            <p className="mt-1 text-2xl font-semibold">{user?.isPremium ? "Premium" : "Free"}</p>
            <p className="mt-2 text-sm text-slate-400">Status: {user?.subscriptionStatus || "inactive"}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs uppercase tracking-wide text-slate-400">Renewal Date</p>
            <p className="mt-1 text-2xl font-semibold">{renewalDate}</p>
            <p className="mt-2 text-sm text-slate-400">Next billing cycle boundary</p>
          </div>
          <div className="metric-card">
            <p className="text-xs uppercase tracking-wide text-slate-400">Next Charge</p>
            <p className="mt-1 text-2xl font-semibold">{nextCharge}</p>
            <p className="mt-2 text-sm text-slate-400">Tax and discounts may vary</p>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Billing</h2>
        <p className="mt-1 text-sm text-slate-300">Choose your plan and manage subscription settings.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-sm text-slate-400">Monthly</p>
            <p className="mt-1 text-2xl font-semibold">£5.99</p>
            <p className="mt-2 text-sm text-slate-400">Best for trying premium features quickly.</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/35 bg-cyan-500/10 p-4">
            <p className="text-sm text-cyan-100">Yearly</p>
            <p className="mt-1 text-2xl font-semibold text-cyan-100">£49.99</p>
            <p className="mt-2 text-sm text-cyan-50/90">Best value plan for long-term progression.</p>
          </div>
        </div>

        <div className="mt-5">
          <BillingActions stripeConfigured={env.stripe.configured} isPremium={Boolean(user?.isPremium)} />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Billing History</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-900/80">
                <td className="py-2 pr-2 text-slate-400">{renewalDate === "Not subscribed" ? "-" : renewalDate}</td>
                <td className="py-2 pr-2">{user?.isPremium ? "EnhanceTyping Premium" : "No active invoices"}</td>
                <td className="py-2 pr-2">{user?.isPremium ? nextCharge : "£0"}</td>
                <td className="py-2 pr-2">
                  <span className={`badge ${user?.isPremium ? "border-emerald-400/40 text-emerald-200" : "border-slate-600 text-slate-300"}`}>
                    {user?.isPremium ? "Active" : "None"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
