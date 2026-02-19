# Buyer Handoff Checklist

Use this checklist to transfer TypeForge to a new owner safely.

## 1. Infrastructure Ownership

- Transfer Git repository ownership.
- Transfer Vercel project ownership.
- Transfer PostgreSQL provider ownership.
- Transfer Stripe account ownership or connect buyer Stripe account.
- Transfer Google OAuth project ownership or create new buyer project.

## 2. Secrets and Keys (Required)

Buyer must replace all keys:

- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_YEARLY`

And set:

- `DEMO_MODE=false`
- `STRICT_PRODUCTION_CHECKS=true`

## 3. Stripe Cutover

- Create products/prices in buyer Stripe account.
- Update price IDs in env.
- Point webhook to buyer domain `/api/stripe/webhook`.
- Send Stripe test webhook events.
- Execute test checkout and billing portal flow.

## 4. OAuth Cutover

- Add OAuth redirect URI:
  - `https://BUYER_DOMAIN/api/auth/callback/google`
- Verify Google sign-in on production domain.

## 5. Database and Auth

- Run migrations in production:

```bash
npm run prisma:generate && npm run prisma:migrate
```

- Create first admin user and set `ADMIN_EMAILS`.

## 6. Production Smoke Tests

- User signup/login (Google + credentials)
- Typing test result auto-save
- Leaderboard update after result save
- Stripe checkout purchase
- Stripe webhook subscription sync
- Billing portal open/return
- Premium feature unlock/lock states

## 7. Security Finalization

- Rotate any legacy keys used by seller.
- Remove seller emails from `ADMIN_EMAILS`.
- Confirm all production secrets are buyer-owned.

## 8. Operational Notes

- Run `npm run validate:prod` before every production deploy.
- Keep demo mode disabled in production.
