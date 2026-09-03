import { env } from "@/lib/env";
import type { ContactSubmission } from "@/lib/repositories";
import { postmarkClient } from "./client";

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
  const textBody = [
    "A new Kazoo48 contact form submission was received.",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    "",
    submission.message,
  ].join("\n");

  try {
    await postmarkClient.sendEmail({
      From: env.POSTMARK_FROM_EMAIL,
      To: env.REGISTRATION_NOTIFICATION_EMAILS.join(","),
      // Lets staff just hit reply to respond directly to the sender.
      ReplyTo: submission.email,
      Subject: `New contact form message from ${submission.name}`,
      TextBody: textBody,
    });
  } catch (error) {
    console.error("Failed to send contact notification email:", error);
  }
}
