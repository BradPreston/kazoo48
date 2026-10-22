"use server";

import { z } from "zod";
import { sendContactNotification } from "@/lib/email/notify-contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { contactSubmissionRepository } from "@/lib/repositories";
import { contactSchema } from "@/lib/validation/contact";
import type { ContactFormValues, CreateContactState } from "./types";

// Public, unauthenticated form with no Stripe cost gate to naturally slow
// abuse (unlike signup) — cap attempts per browser so a script can't spam
// staff inboxes or fill the table. Tighter than signup's 8/10min.
const CONTACT_RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

const TOO_MANY_ATTEMPTS_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again.";

function readFormValues(formData: FormData): ContactFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
}

export async function submitContact(
  _prevState: CreateContactState,
  formData: FormData
): Promise<CreateContactState> {
  const values = readFormValues(formData);
  // Set by ContactWizard just before submit (see lib/recaptcha.client.ts).
  const recaptchaToken = String(formData.get("recaptchaToken") ?? "");

  const { allowed } = await checkRateLimit("submit-contact", CONTACT_RATE_LIMIT);
  if (!allowed) {
    return {
      status: "error",
      formError: TOO_MANY_ATTEMPTS_MESSAGE,
      fieldErrors: {},
      values,
    };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: "error", fieldErrors, values };
  }

  try {
    // Checked before the DB write so likely bots never reach the table or
    // staff inboxes.
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
      console.warn(
        "reCAPTCHA rejected contact submission:",
        recaptchaResult.error,
        recaptchaResult.score
      );
      return {
        status: "error",
        formError: "Security verification failed. Please try again.",
        fieldErrors: {},
        values,
      };
    }

    const submission = await contactSubmissionRepository.create(parsed.data);
    // Fired after the DB write succeeds so a failed notification email
    // never loses a submission that was already saved.
    await sendContactNotification(submission);
  } catch (error) {
    console.error("Failed to save contact submission:", error);
    return {
      status: "error",
      formError: "Something went wrong sending your message. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  return { status: "success" };
}
