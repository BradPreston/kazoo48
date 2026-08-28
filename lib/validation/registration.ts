import { z } from "zod";

export const categoryEnum = z.enum(["amateur", "professional"]);
export type Category = z.infer<typeof categoryEnum>;

// Lowercased so the show-year duplicate-email lock (registrations table's
// unique index on email + showYear) can't be bypassed by resubmitting the
// same address with different casing.
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email"));

/**
 * Single source of truth for the signup form's shape. The server action
 * re-parses the full submission against this (authoritative, never
 * skipped); individual field schemas can be reused client-side for inline
 * on-blur hints, but there is no second, drifting set of rules.
 */
export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: emailField,
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30, "Enter a valid phone number"),
  teamName: z.string().trim().min(1, "Team name is required").max(200),
  category: categoryEnum,
  // Each row is optional (blank is allowed), but a filled-in row must be a
  // valid email. Blank rows are dropped before this ever reaches the
  // repository.
  additionalEmails: z
    .array(z.union([z.literal(""), emailField]))
    .default([])
    .transform((emails) => emails.filter((email) => email !== "")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
