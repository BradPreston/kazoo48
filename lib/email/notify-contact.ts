import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";
import type { ContactSubmission } from "@/lib/repositories";
import { CONTACT_FORM_SENTRY_TAGS } from "@/lib/sentry";
import { postmarkClient } from "./client";

/**
 * Builds and sends the staff notification for a contact form submission,
 * throwing on failure. The email is derived entirely from the stored
 * submission plus env, so calling this again for the same submission
 * reproduces the original email — which is what the resend endpoint
 * (app/api/contact-submissions/resend/route.ts) relies on.
 */
export async function deliverContactNotification(
  submission: ContactSubmission
): Promise<void> {
  const textBody = [
    "A new Kazoo48 contact form submission was received.",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    "",
    submission.message,
  ].join("\n");

  await postmarkClient.sendEmail({
    From: env.POSTMARK_FROM_EMAIL,
    To: env.REGISTRATION_NOTIFICATION_EMAILS.join(","),
    // Lets staff just hit reply to respond directly to the sender.
    ReplyTo: submission.email,
    Subject: `New contact form message from ${submission.name}`,
    TextBody: textBody,
  });
}

/**
 * Notifies staff (env.REGISTRATION_NOTIFICATION_EMAILS — the same list
 * registration payments notify) that a contact form submission came in.
 * Called from app/contact-us/actions.ts after the submission is saved.
 *
 * Deliberately swallows its own errors: this is a side-effect notification,
 * not something that should turn an already-saved submission into a failed
 * request — see sendRegistrationNotification for the same reasoning.
 */
export async function sendContactNotification(
  submission: ContactSubmission
): Promise<void> {
  try {
    await deliverContactNotification(submission);
  } catch (error) {
    console.error("Failed to send contact notification email:", error);
    // The id is what the resend endpoint takes to retry this email.
    Sentry.captureException(error, {
      tags: CONTACT_FORM_SENTRY_TAGS,
      extra: { submissionId: submission.id },
    });
  }
}
