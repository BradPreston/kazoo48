"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  REGISTRATION_TOKEN_COOKIE,
  signRegistrationId,
  verifyRegistrationToken,
} from "@/lib/registration-token";
import {
  DuplicateRegistrationEmailError,
  registrationRepository,
  type Registration,
} from "@/lib/repositories";
import { stripe } from "@/lib/stripe/client";
import { registrationSchema } from "@/lib/validation/registration";
import type {
  CreateRegistrationState,
  RegistrationFormValues,
} from "./types";

// Signup is a public, unauthenticated form — cap attempts per browser so a
// script can't spam the registrations table or spin up Stripe PaymentIntents
// for free. Generous enough that a person retrying a typo'd field never
// notices it.
const SIGNUP_RATE_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 };

// Looser than signup: this also fires automatically (no user action) every
// time Step 2 mounts on a resumed/refreshed page, on top of any manual
// "Try again" clicks.
const PAYMENT_INTENT_RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };

const TOO_MANY_ATTEMPTS_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again.";

function duplicateEmailFieldErrors(showYear: number) {
  return {
    email: [`This email has already registered for the ${showYear} show.`],
  };
}

function readFormValues(formData: FormData): RegistrationFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    teamName: String(formData.get("teamName") ?? ""),
    category: String(formData.get("category") ?? ""),
    additionalEmails: formData.getAll("additionalEmails[]").map(String),
  };
}

export async function createRegistration(
  _prevState: CreateRegistrationState,
  formData: FormData
): Promise<CreateRegistrationState> {
  const values = readFormValues(formData);

  const { allowed } = await checkRateLimit("create-registration", SIGNUP_RATE_LIMIT);
  if (!allowed) {
    return {
      status: "error",
      formError: TOO_MANY_ATTEMPTS_MESSAGE,
      fieldErrors: {},
      values,
    };
  }

  const parsed = registrationSchema.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: "error", fieldErrors, values };
  }

  // Friendly path: catches the common case up front so a duplicate signup
  // never has to round-trip through a DB constraint failure. The insert
  // below is still guarded (see the catch block) for the race where two
  // submissions with the same email land concurrently.
  const existing = await registrationRepository.findByEmailForShowYear(
    parsed.data.email,
    env.SHOW_YEAR
  );
  if (existing) {
    return {
      status: "error",
      fieldErrors: duplicateEmailFieldErrors(env.SHOW_YEAR),
      values,
    };
  }

  let registration: Registration;
  try {
    registration = await registrationRepository.create({
      ...parsed.data,
      showYear: env.SHOW_YEAR,
    });
  } catch (error) {
    if (error instanceof DuplicateRegistrationEmailError) {
      return {
        status: "error",
        fieldErrors: duplicateEmailFieldErrors(env.SHOW_YEAR),
        values,
      };
    }
    console.error("Failed to create registration:", error);
    return {
      status: "error",
      formError:
        "Something went wrong saving your registration. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  // Authorizes this browser (and only this browser) to resume/pay this
  // registration on Step 2 — see lib/registration-token.ts. Scoped to
  // /register so it isn't sent on every request elsewhere on the site.
  const cookieStore = await cookies();
  cookieStore.set(
    REGISTRATION_TOKEN_COOKIE,
    signRegistrationId(registration.id),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/register",
      maxAge: 60 * 60 * 24, // 1 day: enough to resume after a refresh, short enough to bound a leaked cookie's window
    }
  );

  // Uses the row just created in-process, not `createPaymentIntentForRegistration`
  // — that exported action re-checks the resume cookie against `cookies()`,
  // and reading a cookie back in the same request right after `.set()` is
  // not guaranteed, so the immediate post-signup path goes straight to the
  // shared core instead of round-tripping through that check.
  const paymentResult = await createPaymentIntentForExistingRegistration(
    registration
  );

  return {
    status: "success",
    registrationId: registration.id,
    clientSecret:
      paymentResult.status === "success" ? paymentResult.clientSecret : null,
  };
}

export type PaymentIntentResult =
  | { status: "success"; clientSecret: string }
  | { status: "already_paid" }
  | { status: "not_found" }
  | { status: "error"; message: string };

/**
 * Public resume/retry entry point — called by the client when Step 2 mounts
 * from a `?rid=` URL without an in-memory client secret (a fresh page load,
 * a refresh, or recovering from a PaymentIntent creation failure).
 *
 * `registrationId` alone isn't treated as authorization: it's an
 * unguessable UUID, but it sits in the URL, so it can leak (browser
 * history, a shared screenshot, a proxy log) to someone who never signed
 * up. Every call is checked against the resume cookie `createRegistration`
 * set for the browser that actually created this registration — anyone
 * else gets the same "not_found" a nonexistent id would produce, rather
 * than a distinguishable "yes, but it's not yours".
 */
export async function createPaymentIntentForRegistration(
  registrationId: string
): Promise<PaymentIntentResult> {
  const { allowed } = await checkRateLimit(
    "payment-intent",
    PAYMENT_INTENT_RATE_LIMIT
  );
  if (!allowed) {
    return { status: "error", message: TOO_MANY_ATTEMPTS_MESSAGE };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(REGISTRATION_TOKEN_COOKIE)?.value;
  if (!verifyRegistrationToken(registrationId, token)) {
    return { status: "not_found" };
  }

  const registration = await registrationRepository.findById(registrationId);
  if (!registration) {
    return { status: "not_found" };
  }

  return createPaymentIntentForExistingRegistration(registration);
}

/**
 * Creates (or reuses) the Stripe PaymentIntent for an already-loaded,
 * already-authorized registration — never creates a duplicate PaymentIntent
 * for the same registration. Shared by the resume path above and by
 * `createRegistration`'s immediate post-signup call, which already holds
 * the row it just inserted and doesn't need the id/cookie check again.
 */
async function createPaymentIntentForExistingRegistration(
  registration: Registration
): Promise<PaymentIntentResult> {
  if (registration.paid) {
    return { status: "already_paid" };
  }

  try {
    if (registration.stripePaymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(
        registration.stripePaymentIntentId
      );
      if (existing.status !== "canceled" && existing.client_secret) {
        return { status: "success", clientSecret: existing.client_secret };
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: env.REGISTRATION_FEE_CENTS,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { registrationId: registration.id },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe did not return a client secret");
    }

    await registrationRepository.attachPaymentIntent(
      registration.id,
      paymentIntent.id
    );

    return { status: "success", clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Failed to create/retrieve payment intent:", error);
    return {
      status: "error",
      message: "Could not start payment. Please try again.",
    };
  }
}
