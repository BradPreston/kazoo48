import { z } from "zod";

/**
 * Validated environment variables. Import from here instead of reading
 * `process.env` directly so a missing/malformed value fails fast with a
 * clear message instead of surfacing as a confusing error deep in Drizzle
 * or Stripe.
 */
const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1, "TURSO_DATABASE_URL is required"),
  TURSO_AUTH_TOKEN: z.string().min(1, "TURSO_AUTH_TOKEN is required"),
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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment variables. Check your .env.local against .env.example:\n${issues}`
  );
}

export const env = parsed.data;
