import type { Category } from "@/lib/validation/registration";

export type { Category };

export type NewRegistrationInput = {
  name: string;
  email: string;
  phone: string;
  teamName: string;
  category: Category;
  additionalEmails: string[];
  showYear: number;
};

export type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  teamName: string;
  category: Category;
  additionalEmails: string[];
  showYear: number;
  paid: boolean;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Thrown by `create()` when the (email, showYear) uniqueness constraint is
 * violated at the database level — the race-condition backstop behind the
 * proactive `findByEmailForShowYear` check callers should do first. Callers
 * should catch this specifically and show a friendly per-field error
 * instead of falling through to a generic failure message.
 */
export class DuplicateRegistrationEmailError extends Error {
  constructor(
    public readonly email: string,
    public readonly showYear: number
  ) {
    super(`Email ${email} has already registered for the ${showYear} show.`);
    this.name = "DuplicateRegistrationEmailError";
  }
}

/**
 * Data-access boundary for registrations. Server actions and the Stripe
 * webhook route only ever depend on this interface (via the singleton
 * exported from `./index`), never on Drizzle or the DB client directly.
 * Swapping the persistence layer (e.g. to Prisma) means writing a new
 * class that implements this interface and changing the one place that
 * constructs the singleton in `./index.ts` — nothing else has to change.
 */
export interface RegistrationRepository {
  create(input: NewRegistrationInput): Promise<Registration>;
  findById(id: string): Promise<Registration | null>;
  findByPaymentIntentId(paymentIntentId: string): Promise<Registration | null>;
  findByEmailForShowYear(
    email: string,
    showYear: number
  ): Promise<Registration | null>;
  attachPaymentIntent(id: string, paymentIntentId: string): Promise<void>;
  markPaidByPaymentIntentId(
    paymentIntentId: string
  ): Promise<Registration | null>;
}
