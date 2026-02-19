import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  if (!env.stripe.configured || !stripe) {
    return NextResponse.json(
      { error: "Billing not configured. Add Stripe environment variables to enable billing portal." },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing customer found." }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${env.appUrl}/profile`
  });

  return NextResponse.json({ url: portal.url });
}
