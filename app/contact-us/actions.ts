"use server";

import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";
import { z } from "zod";
import { sendContactNotification } from "@/lib/email/notify-contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { contactSubmissionRepository } from "@/lib/repositories";
import { CONTACT_FORM_SENTRY_TAGS } from "@/lib/sentry";
import { detectContactSpam, HONEYPOT_FIELD } from "@/lib/spam";
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

/**
 * Reports a submission this action turned away without throwing — Sentry
 * only sees exceptions on its own. `fingerprint` groups every occurrence
 * into one issue per kind instead of one per distinct message. Never
 * include the visitor's name, email, or message in `extra`.
 */
function reportRejectedSubmission(
  message: string,
  fingerprint: string[],
  extra?: Record<string, unknown>
) {
  Sentry.captureMessage(message, {
    level: "warning",
    fingerprint: ["contact-form", ...fingerprint],
    tags: CONTACT_FORM_SENTRY_TAGS,
    extra,
  });
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
    reportRejectedSubmission("Contact submission rate limited", [
      "rate-limited",
    ]);
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
    reportRejectedSubmission(
      "Contact submission failed validation",
      ["validation-failed"],
      // Which rules failed, not the values that failed them.
      { fieldErrors }
    );
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
      reportRejectedSubmission(
        "reCAPTCHA rejected contact submission",
        ["recaptcha-rejected"],
        { reason: recaptchaResult.error, recaptchaScore: recaptchaResult.score }
      );
      return {
        status: "error",
        formError: "Security verification failed. Please try again.",
        fieldErrors: {},
        values,
      };
    }

    // Checked after reCAPTCHA so the log shows what score the bot got.
    // Answers with a fake success so the bot gets no signal to adapt to.
    const spamReason = detectContactSpam(
      parsed.data,
      String(formData.get(HONEYPOT_FIELD) ?? "")
    );
    if (spamReason) {
      console.warn(
        "Dropped spam contact submission:",
        spamReason,
        "reCAPTCHA score",
        recaptchaResult.score
      );
      // The visitor sees success, so this is the only trace of a drop —
      // including a real person caught by a false positive.
      reportRejectedSubmission(
        `Dropped spam contact submission: ${spamReason}`,
        ["spam-dropped", spamReason],
        { recaptchaScore: recaptchaResult.score }
      );
      return { status: "success" };
    }

    const submission = await contactSubmissionRepository.create(parsed.data);
    // Fired after the DB write succeeds so a failed notification email
    // never loses a submission that was already saved — and via after() so
    // the visitor sees "Message sent!" without waiting on Postmark. It
    // swallows (and reports) its own errors, and the resend endpoint covers
    // a lost email.
    after(() => sendContactNotification(submission));
  } catch (error) {
    console.error("Failed to save contact submission:", error);
    // Caught to show the visitor a friendly error, so Sentry would never
    // see it otherwise.
    Sentry.captureException(error, { tags: CONTACT_FORM_SENTRY_TAGS });
    return {
      status: "error",
      formError: "Something went wrong sending your message. Please try again.",
      fieldErrors: {},
      values,
    };
  }

  return { status: "success" };
}
