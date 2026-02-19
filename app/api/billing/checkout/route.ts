import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  interval: z.enum(["monthly", "yearly"]).default("monthly")
});

export async function POST(request: Request) {
  if (!env.stripe.configured || !stripe) {
    return NextResponse.json(
      { error: "Billing not configured. Add Stripe environment variables to enable subscriptions." },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid billing payload." }, { status: 400 });
  }
  const interval = parsed.data.interval;
  const priceId =
    interval === "yearly" ? process.env.STRIPE_PRICE_ID_YEARLY : process.env.STRIPE_PRICE_ID_MONTHLY;
  if (!priceId) {
    return NextResponse.json({ error: "Price ID is not configured." }, { status: 500 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  let customerId = user?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name || undefined,
      metadata: { userId: session.user.id }
    });
    customerId = customer.id;

    await prisma.user.update({ where: { id: session.user.id }, data: { stripeCustomerId: customerId } });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    success_url: `${env.appUrl}/profile?billing=success`,
    cancel_url: `${env.appUrl}/pricing?billing=cancelled`,
    allow_promotion_codes: true,
    customer_update: {
      address: "auto",
      name: "auto"
    },
    subscription_data: {
      trial_period_days: 7
    },
    metadata: {
      userId: session.user.id
    }
  });

  return NextResponse.json({ url: checkout.url });
}
