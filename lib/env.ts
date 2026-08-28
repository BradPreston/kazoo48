import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Local/dev-only fallbacks so the app boots — and Step 1's DB write in
 * particular works — before Stripe/Turso are configured. Never applied in
 * production: a missing var there fails loudly, on purpose, instead of
 * silently taking payments against a fake key or writing to a throwaway
 * local database.
 *
 * These are safe to fall back to because nothing here can succeed against
 * a real service: a placeholder Stripe key just makes any actual Stripe
 * call fail with a clear 401 (caught and surfaced as a "could not start
 * payment" error in the UI, not a crash), and a local SQLite file is
 * exactly what local testing wants.
 */
const devDefaults: Record<string, string> = {
  TURSO_DATABASE_URL: "file:./local.db",
  STRIPE_SECRET_KEY: "sk_test_not_configured",
  STRIPE_WEBHOOK_SECRET: "whsec_not_configured",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_not_configured",
  REGISTRATION_FEE_CENTS: "5000",
  // Only signs a per-browser cookie that proves "this browser created
  // this registration" (see lib/registration-token.ts) — not itself a
  // credential, but a fixed dev value is still wrong for production, so
  // it's excluded there like every other default here.
  REGISTRATION_TOKEN_SECRET: "dev-only-registration-token-secret-do-not-use-in-production",
};

// process.env values are `string | undefined`; a blank `FOO=` line in
// .env parses to `""`, which should behave like "not set" too.
const resolved: Record<string, string | undefined> = { ...process.env };
const usingDefaults: string[] = [];

if (!isProduction) {
  for (const [key, fallback] of Object.entries(devDefaults)) {
    if (!resolved[key]) {
      resolved[key] = fallback;
      usingDefaults.push(key);
    }
  }
  if (usingDefaults.length > 0) {
    console.warn(
      `[env] Using local dev defaults for: ${usingDefaults.join(", ")}. Set real values in .env before testing Stripe payments or a real Turso database.`
    );
  }
}

/**
 * Validated environment variables. Import from here instead of reading
 * `process.env` directly so a missing/malformed value fails fast with a
 * clear message instead of surfacing as a confusing error deep in Drizzle
 * or Stripe.
 */
const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1, "TURSO_DATABASE_URL is required"),
  // Only meaningful for a remote (libsql://) TURSO_DATABASE_URL; a local
  // `file:` database needs no auth token. A blank `.env` line normalizes
  // to undefined rather than "".
  TURSO_AUTH_TOKEN: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, "STRIPE_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),
  REGISTRATION_FEE_CENTS: z.coerce
    .number()
    .int()
    .positive("REGISTRATION_FEE_CENTS must be a positive integer"),
  REGISTRATION_TOKEN_SECRET: z
    .string()
    .min(32, "REGISTRATION_TOKEN_SECRET must be at least 32 characters"),
});

const parsed = envSchema.safeParse(resolved);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment variables. Check your .env against .env.example:\n${issues}`
  );
}

export const env = parsed.data;
