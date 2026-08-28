import { and, eq } from "drizzle-orm";
import { LibsqlError } from "@libsql/client";
import type { db as Db } from "@/lib/db/client";
import { registrations, type RegistrationRow } from "@/lib/db/schema";
import {
  DuplicateRegistrationEmailError,
  type NewRegistrationInput,
  type Registration,
  type RegistrationRepository,
} from "./registration-repository";

function toRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    teamName: row.teamName,
    category: row.category,
    additionalEmails: row.additionalEmails,
    showYear: row.showYear,
    paid: row.paid,
    stripePaymentIntentId: row.stripePaymentIntentId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// SQLite's message for a UNIQUE violation lists the conflicting index's
// columns as `table.column, table.column` — stable regardless of the
// index's name, so match on that rather than the index name itself.
function isDuplicateEmailShowYearError(error: unknown): boolean {
  return (
    error instanceof LibsqlError &&
    error.extendedCode === "SQLITE_CONSTRAINT_UNIQUE" &&
    error.message.includes("registrations.email") &&
    error.message.includes("registrations.show_year")
  );
}

export class DrizzleRegistrationRepository implements RegistrationRepository {
  constructor(private readonly db: typeof Db) {}

  async create(input: NewRegistrationInput): Promise<Registration> {
    try {
      const [row] = await this.db
        .insert(registrations)
        .values({
          name: input.name,
          email: input.email,
          phone: input.phone,
          teamName: input.teamName,
          category: input.category,
          additionalEmails: input.additionalEmails,
          showYear: input.showYear,
        })
        .returning();

      return toRegistration(row);
    } catch (error) {
      if (isDuplicateEmailShowYearError(error)) {
        throw new DuplicateRegistrationEmailError(input.email, input.showYear);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Registration | null> {
    const row = await this.db.query.registrations.findFirst({
      where: eq(registrations.id, id),
    });
    return row ? toRegistration(row) : null;
  }

  async findByEmailForShowYear(
    email: string,
    showYear: number
  ): Promise<Registration | null> {
    const row = await this.db.query.registrations.findFirst({
      where: and(
        eq(registrations.email, email),
        eq(registrations.showYear, showYear)
      ),
    });
    return row ? toRegistration(row) : null;
  }

  async findByPaymentIntentId(
    paymentIntentId: string
  ): Promise<Registration | null> {
    const row = await this.db.query.registrations.findFirst({
      where: eq(registrations.stripePaymentIntentId, paymentIntentId),
    });
    return row ? toRegistration(row) : null;
  }

  async attachPaymentIntent(
    id: string,
    paymentIntentId: string
  ): Promise<void> {
    await this.db
      .update(registrations)
      .set({ stripePaymentIntentId: paymentIntentId, updatedAt: new Date() })
      .where(eq(registrations.id, id));
  }

  async markPaidByPaymentIntentId(
    paymentIntentId: string
  ): Promise<Registration | null> {
    const [row] = await this.db
      .update(registrations)
      .set({ paid: true, updatedAt: new Date() })
      .where(eq(registrations.stripePaymentIntentId, paymentIntentId))
      .returning();

    return row ? toRegistration(row) : null;
  }
}
