import { env } from "@/lib/env";

const REQUIRED_BASE_KEYS = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET", "APP_URL"] as const;
const REQUIRED_STRIPE_KEYS = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_MONTHLY",
  "STRIPE_PRICE_ID_YEARLY"
] as const;
const REQUIRED_GOOGLE_KEYS = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const;

function isMissing(key: string) {
  const value = process.env[key];
  return !value || value.trim().length === 0;
}

export function getProductionMissingKeys() {
  const missing: string[] = [];

  for (const key of REQUIRED_BASE_KEYS) {
    if (isMissing(key)) missing.push(key);
  }

  // In strict production mode we require full social auth + billing.
  if (env.features.strictProductionChecks) {
    for (const key of REQUIRED_STRIPE_KEYS) {
      if (isMissing(key)) missing.push(key);
    }
    for (const key of REQUIRED_GOOGLE_KEYS) {
      if (isMissing(key)) missing.push(key);
    }
  }

  return missing;
}

export function assertProductionReady(context: string) {
  if (!env.features.strictProductionChecks) return;

  const missing = getProductionMissingKeys();
  if (missing.length === 0) return;

  throw new Error(
    `[${context}] Missing required production environment variables: ${missing.join(", ")}. ` +
      "Set these keys before running in strict production mode."
  );
}
