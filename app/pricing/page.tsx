import Link from "next/link";
import { PricingPlans } from "@/components/pricing-plans";
import { env } from "@/lib/env";

export default function PricingPage() {
  const stripeConfigured = env.stripe.configured;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-1 text-sm text-slate-400">Choose how deeply you want to improve: core training or full personalized guidance.</p>
      </div>
      {!stripeConfigured ? (
        <div className="soft-alert">
          <p className="font-medium">Billing setup required</p>
          <p className="mt-1 text-xs text-amber-100/90">Plan selection UI is live. Connect Stripe to activate checkout.</p>
        </div>
      ) : null}
      <PricingPlans stripeConfigured={stripeConfigured} />
      <div className="text-sm text-slate-400">
        Need enterprise or team setup? <Link href="/profile" className="text-cyan-300 hover:text-cyan-200">Contact via profile support path</Link>.
      </div>
    </div>
  );
}
