import Stripe from "stripe";
import { env } from "@/lib/env";

// Pinned to the version bundled with the installed `stripe` package
// (`node_modules/stripe/cjs/apiVersion.js`) rather than left to float:
// without a pin, Stripe serves whatever API version was active on the
// account's creation date, which this codebase never validated against
// and which can differ silently between environments. Bump this
// deliberately (and re-check the changelog) when the `stripe` package is
// upgraded — don't let it drift out of sync with the SDK's own bundled
// version.
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-08-26.dahlia",
});
