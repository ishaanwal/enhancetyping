# TypeForge

TypeForge is a Next.js 14 typing platform with production-grade account auth, leaderboards, and Stripe subscriptions.

## Tech Stack

- Next.js 14 App Router + TypeScript
- Prisma + PostgreSQL
- NextAuth (Google OAuth, email magic link, credentials)
- Stripe Checkout + Billing Portal + Webhooks
- Tailwind CSS

## Production Modes

Two runtime modes are supported:

- Demo mode (local preview): `DEMO_MODE=true`
- Production mode (for real customers): `DEMO_MODE=false` and `STRICT_PRODUCTION_CHECKS=true`

## Environment Variables

Use `.env.example` as baseline and create `.env.local`.

Required for production:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_YEARLY`
- `DEMO_MODE=false`
- `STRICT_PRODUCTION_CHECKS=true`

## Local Setup

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env.local
```

4. Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Run app:

```bash
npm run dev
```

## Production Validation

Before deploy, run:

```bash
npm run validate:prod
```

This checks required keys and confirms production toggles are set correctly.

## Google OAuth

- Add callback URL in Google Console:
  - `https://YOUR_DOMAIN/api/auth/callback/google`
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

## Stripe Setup

- Create Monthly and Yearly recurring prices in Stripe.
- Put their IDs in:
  - `STRIPE_PRICE_ID_MONTHLY`
  - `STRIPE_PRICE_ID_YEARLY`
- Configure webhook endpoint:
  - `POST https://YOUR_DOMAIN/api/stripe/webhook`
- Subscribe these events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## Deploy (Vercel)

1. Import repo into Vercel.
2. Configure production env vars.
3. Run migration job:

```bash
npm run prisma:generate && npm run prisma:migrate
```

4. Deploy.
5. Run Stripe webhook test and a full purchase flow test.

## Buyer Transfer

See:

- `docs/BUYER_HANDOFF.md`

This includes domain transfer, key rotation, Stripe ownership handoff, and go-live checklist.
