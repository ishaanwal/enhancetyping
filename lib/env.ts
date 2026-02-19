const hasValue = (value: string | undefined) => Boolean(value && value.trim().length > 0);
const isTrue = (value: string | undefined) => value === "1" || value === "true";

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const demoMode = isTrue(process.env.DEMO_MODE) || (!isProduction && process.env.DEMO_MODE !== "false");

export const env = {
  appUrl: process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  nodeEnv,
  isProduction,
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
  auth: {
    googleConfigured: hasValue(process.env.GOOGLE_CLIENT_ID) && hasValue(process.env.GOOGLE_CLIENT_SECRET),
    emailConfigured: hasValue(process.env.RESEND_API_KEY) && hasValue(process.env.EMAIL_FROM)
  },
  stripe: {
    configured:
      hasValue(process.env.STRIPE_SECRET_KEY) &&
      hasValue(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) &&
      hasValue(process.env.STRIPE_PRICE_ID_MONTHLY) &&
      hasValue(process.env.STRIPE_PRICE_ID_YEARLY),
    webhookConfigured:
      hasValue(process.env.STRIPE_SECRET_KEY) &&
      hasValue(process.env.STRIPE_WEBHOOK_SECRET)
  },
  features: {
    demoMode,
    strictProductionChecks: isTrue(process.env.STRICT_PRODUCTION_CHECKS) || isProduction
  },
  antiCheat: {
    maxWpm: Number(process.env.MAX_ALLOWED_WPM || 260),
    minAccuracy: Number(process.env.MIN_ALLOWED_ACCURACY || 70)
  }
};

export const isDemoMode = env.features.demoMode;
