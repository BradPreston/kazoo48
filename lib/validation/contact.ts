import { z } from "zod";

const emailField = z.string().trim().pipe(z.email("Enter a valid email"));

/**
 * Single source of truth for the contact form's shape — same pattern as
 * `registrationSchema`. The server action re-parses the full submission
 * against this (authoritative, never skipped).
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: emailField,
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
