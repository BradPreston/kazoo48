"use client";

import { useState, type FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { ctaClassName } from "@/components/buttonStyles";
import { getStripePublishableKey } from "@/lib/env.client";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (!stripePromise) {
    stripePromise = loadStripe(getStripePublishableKey());
  }
  return stripePromise;
}

const submitButtonClassName = `${ctaClassName("primary")} w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_var(--color-ink)]`;

function ConfirmationCard() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border-2 border-ink bg-primary p-8 text-center shadow-[6px_6px_0_0_var(--color-ink)]">
      <h3 className="text-xl font-bold text-ink">You&apos;re registered!</h3>
      <p className="text-sm text-ink/80">
        Payment received — we&apos;ll be in touch with next steps.
      </p>
    </div>
  );
}

function PayForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<
    "idle" | "submitting" | "succeeded" | "processing"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setStatus("submitting");
    setErrorMessage(null);

    // `redirect: "if_required"` keeps card payments resolving in-page
    // instead of forcing a redirect leg — a `return_url` is still required
    // by the API even though it's rarely taken.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/register`,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setStatus("idle");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Optimistic UI only — the `paid` column is flipped by the Stripe
      // webhook (the source of truth), which typically lands within a
      // second or two of a card payment succeeding.
      setStatus("succeeded");
    } else {
      setStatus("processing");
    }
  }

  if (status === "succeeded") {
    return <ConfirmationCard />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6 rounded-md border-2 border-ink bg-white p-8 shadow-[6px_6px_0_0_var(--color-ink)]"
    >
      <PaymentElement />

      {status === "processing" && (
        <p className="text-sm text-ink/70">
          Your payment is processing — we&apos;ll confirm by email shortly.
        </p>
      )}

      {errorMessage && (
        <p className="rounded-md border-2 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || status === "submitting"}
        className={submitButtonClassName}
      >
        {status === "submitting" ? "Processing…" : "Pay & complete registration"}
      </button>
    </form>
  );
}

export default function PaymentForm({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements
      stripe={getStripePromise()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#5bbb72",
            colorText: "#18181b",
            borderRadius: "6px",
          },
        },
      }}
    >
      <PayForm />
    </Elements>
  );
}
