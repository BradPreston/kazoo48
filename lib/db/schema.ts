import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const registrations = sqliteTable(
  "registrations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    teamName: text("team_name").notNull(),

    category: text("category", {
      enum: ["amateur", "professional"],
    }).notNull(),

    // The show/festival year this registration belongs to, set from the
    // SHOW_YEAR env var at creation time (never a SQL-level default — it
    // changes yearly and only the app knows the current value). Paired
    // with the unique index below, this is what lets the same email
    // register again once SHOW_YEAR is bumped for a new show.
    showYear: integer("show_year").notNull(),

    // Extra team-member emails the entrant adds on the signup form. Stored as
    // JSON rather than a child table: nothing in the current product queries
    // across these independently, and this keeps registration creation a
    // single-statement insert. Revisit as a `registration_emails` child table
    // if that changes — it's isolated behind the repository, so that would be
    // a contained change.
    additionalEmails: text("additional_emails", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),

    // SQLite has no native boolean; Drizzle's boolean-mode integer maps
    // JS true/false <-> 1/0 transparently.
    paid: integer("paid", { mode: "boolean" }).notNull().default(false),

    // Set once the payment step creates a PaymentIntent. Nullable + unique:
    // SQLite unique indexes allow multiple NULLs, so this is safe to leave
    // unset pre-payment while still preventing the same PaymentIntent from
    // ever being attached to two rows.
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    // Locks a given email to one registration per show year — the DB-level
    // backstop behind the friendly pre-check in the register server action.
    // Also serves as the lookup index for that pre-check.
    uniqueIndex("registrations_email_show_year_unique").on(
      table.email,
      table.showYear
    ),
  ]
);

export type RegistrationRow = typeof registrations.$inferSelect;
export type NewRegistrationRow = typeof registrations.$inferInsert;
