import Stripe from "stripe";
import { env } from "@/lib/env";

// No pinned `apiVersion` — let the SDK use its bundled default so this
// doesn't go stale. Bump the `stripe` package deliberately if a specific
// API version's behavior is ever needed.
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
