import type Stripe from "stripe";
import { env } from "@/lib/env";
import { registrationRepository } from "@/lib/repositories";
import { stripe } from "@/lib/stripe/client";

// Node runtime (the default for route handlers) is required here — the
// Stripe SDK needs Node's crypto APIs for signature verification. Do not
// add `export const runtime = "edge"` to this file.

export async function POST(request: Request) {
  // Must read the raw body (not `.json()`) — Stripe's signature is computed
  // over the exact bytes sent, and Next's route handlers hand us the real
  // Web `Request`, so this works without any body-parser opt-out.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    try {
      // Idempotent by construction — Stripe redelivers events at-least-once,
      // and setting `paid = true` twice is harmless.
      await registrationRepository.markPaidByPaymentIntentId(
        paymentIntent.id
      );
    } catch (error) {
      console.error("Failed to mark registration as paid:", error);
      // Non-2xx tells Stripe to retry delivery.
      return new Response("Failed to process webhook", { status: 500 });
    }
  }

  return new Response("ok", { status: 200 });
}
