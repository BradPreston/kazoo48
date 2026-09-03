export type NewContactSubmissionInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
};

/**
 * Data-access boundary for contact form submissions. The server action only
 * ever depends on this interface (via the singleton exported from
 * `./index`), never on Drizzle or the DB client directly — same shape as
 * `RegistrationRepository`.
 */
export interface ContactSubmissionRepository {
  create(input: NewContactSubmissionInput): Promise<ContactSubmission>;
}
