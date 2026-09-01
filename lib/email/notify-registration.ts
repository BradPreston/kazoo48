import { env } from "@/lib/env";
import type { Registration } from "@/lib/repositories";
import { postmarkClient } from "./client";

/**
 * Notifies staff (env.REGISTRATION_NOTIFICATION_EMAILS) that a registration
 * has been paid. Called from the Stripe webhook once
 * `markPaidByPaymentIntentId` confirms payment — see
 * app/api/webhooks/stripe/route.ts.
 *
 * Deliberately swallows its own errors: this is a side-effect notification,
 * not something that should turn a successfully-recorded payment into a
 * failed webhook (and a Stripe retry).
 */
export async function sendRegistrationNotification(
  registration: Registration
): Promise<void> {
  const textBody = [
    `A new registration has been paid for the ${registration.showYear} show.`,
    "",
    `Name: ${registration.name}`,
    `Email: ${registration.email}`,
    `Phone: ${registration.phone}`,
    `Team name: ${registration.teamName}`,
    `Category: ${registration.category}`,
    `Show year: ${registration.showYear}`,
    `${registration.additionalEmails.length ? `Additional emails: ${registration.additionalEmails.join(', ')}` : ''}`
  ].join("\n");

  try {
    await postmarkClient.sendEmail({
      From: env.POSTMARK_FROM_EMAIL,
      To: env.REGISTRATION_NOTIFICATION_EMAILS.join(","),
      Subject: `New Registration: ${registration.teamName}`,
      TextBody: textBody,
    });
  } catch (error) {
    console.error("Failed to send registration notification email:", error);
  }
}
