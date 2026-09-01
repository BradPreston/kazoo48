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
  attachPaymentIntent(id: string, paymentIntentId: string): Promise<void>;
  markPaidByPaymentIntentId(
    paymentIntentId: string
  ): Promise<Registration | null>;
}
