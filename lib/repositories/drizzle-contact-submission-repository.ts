import type { db as Db } from "@/lib/db/client";
import { contactSubmissions, type ContactSubmissionRow } from "@/lib/db/schema";
import type {
  ContactSubmission,
  ContactSubmissionRepository,
  NewContactSubmissionInput,
} from "./contact-submission-repository";

function toContactSubmission(row: ContactSubmissionRow): ContactSubmission {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.createdAt,
  };
}

export class DrizzleContactSubmissionRepository
  implements ContactSubmissionRepository
{
  constructor(private readonly db: typeof Db) {}

  async create(input: NewContactSubmissionInput): Promise<ContactSubmission> {
    const [row] = await this.db
      .insert(contactSubmissions)
      .values({
        name: input.name,
        email: input.email,
        message: input.message,
      })
      .returning();

    return toContactSubmission(row);
  }
}
