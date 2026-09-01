import { eq } from "drizzle-orm";
import type { db as Db } from "@/lib/db/client";
import { registrations, type RegistrationRow } from "@/lib/db/schema";
import type {
  NewRegistrationInput,
  Registration,
  RegistrationRepository,
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

export class DrizzleRegistrationRepository implements RegistrationRepository {
  constructor(private readonly db: typeof Db) {}

  async create(input: NewRegistrationInput): Promise<Registration> {
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
  }

  async findById(id: string): Promise<Registration | null> {
    const row = await this.db.query.registrations.findFirst({
      where: eq(registrations.id, id),
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
