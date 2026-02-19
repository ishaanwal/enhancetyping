import type Stripe from "stripe";
import { SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const ACTIVE_STATUSES = new Set(["trialing", "active"]);

function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return SubscriptionStatus.trialing;
    case "active":
      return SubscriptionStatus.active;
    case "past_due":
      return SubscriptionStatus.past_due;
    case "canceled":
      return SubscriptionStatus.canceled;
    case "unpaid":
      return SubscriptionStatus.unpaid;
    default:
      return SubscriptionStatus.inactive;
  }
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subId = subscription.id;
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const status = subscription.status;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subId,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: periodEnd,
      subscriptionStatus: mapStripeStatus(status),
      isPremium: ACTIVE_STATUSES.has(status)
    }
  });
}

export async function POST(request: Request) {
  if (!env.stripe.webhookConfigured || !stripe) {
    return NextResponse.json({ message: "Billing not configured. Webhook ignored in demo mode." });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await syncSubscription(sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscription(sub);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
