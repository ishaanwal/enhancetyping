import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local file.");
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  env[key] = value;
}

const required = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "APP_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_MONTHLY",
  "STRIPE_PRICE_ID_YEARLY"
];

const missing = required.filter((key) => !env[key] || env[key].length === 0);

if (missing.length) {
  console.error("Production validation failed. Missing keys:");
  for (const key of missing) console.error(`- ${key}`);
  process.exit(1);
}

if ((env.DEMO_MODE || "false") !== "false") {
  console.error("Production validation failed. DEMO_MODE must be false.");
  process.exit(1);
}

if ((env.STRICT_PRODUCTION_CHECKS || "true") !== "true") {
  console.error("Production validation failed. STRICT_PRODUCTION_CHECKS must be true.");
  process.exit(1);
}

console.log("Production validation passed.");
