/**
 * Env access safe to import from Client Components. Next.js only inlines
 * `NEXT_PUBLIC_*` variables into the browser bundle, so this file must never
 * reference anything from `@/lib/env` (which validates server-only secrets
 * and would throw in the browser, where those vars are never present).
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Check your .env.local against .env.example."
    );
  }
  return key;
}
