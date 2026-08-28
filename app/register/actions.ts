"use server";

import { z } from "zod";
import { env } from "@/lib/env";
import { registrationRepository } from "@/lib/repositories";
import { stripe } from "@/lib/stripe/client";
import { registrationSchema } from "@/lib/validation/registration";

export type RegistrationFormValues = {
  name: string;
  email: string;
  phone: string;
  teamName: string;
  category: string;
  additionalEmails: string[];
};

export type CreateRegistrationState =
  | { status: "idle" }
  | {
      status: "error";
      formError?: string;
      fieldErrors: Partial<Record<keyof RegistrationFormValues, string[]>>;
      values: RegistrationFormValues;
    }
  | {
      status: "success";
      registrationId: string;
      // null when the registration saved but the immediate PaymentIntent
      // creation failed (e.g. a transient Stripe error) — the client still
      // advances to Step 2 and `createPaymentIntentForRegistration` there
      // picks up the retry, the same path used to resume after a refresh.
      clientSecret: string | null;
    };

export const initialCreateRegistrationState: CreateRegistrationState = {
  status: "idle",
};

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

  const parsed = registrationSchema.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: "error", fieldErrors, values };
  }

  let registrationId: string;
  try {
    const registration = await registrationRepository.create(parsed.data);
    registrationId = registration.id;
  } catch (error) {
    console.error("Failed to create registration:", error);
    return {
      status: "error",
      formError:
        "Something went wrong saving your registration. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  const paymentResult = await createPaymentIntentForRegistration(
    registrationId
  );

  return {
    status: "success",
    registrationId,
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
 * Creates (or reuses) the Stripe PaymentIntent for a registration. Re-reads
 * the registration server-side by id — the only thing the client supplies
 * is a reference to its own row, never its state — and never creates a
 * duplicate PaymentIntent for the same registration. Used both right after
 * signup (as part of `createRegistration`) and as the resume/retry action
 * when Step 2 mounts from a `?rid=` URL without an in-memory client secret.
 */
export async function createPaymentIntentForRegistration(
  registrationId: string
): Promise<PaymentIntentResult> {
  const registration = await registrationRepository.findById(registrationId);
  if (!registration) {
    return { status: "not_found" };
  }
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
