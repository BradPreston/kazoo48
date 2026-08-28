import { db } from "@/lib/db/client";
import { DrizzleRegistrationRepository } from "./drizzle-registration-repository";
import type { RegistrationRepository } from "./registration-repository";

// The one place a concrete implementation is wired up. To swap persistence
// layers (e.g. to Prisma) later: write a `PrismaRegistrationRepository`
// implementing `RegistrationRepository` and change this one line — every
// consumer below only imports the interface-typed singleton.
export const registrationRepository: RegistrationRepository =
  new DrizzleRegistrationRepository(db);

export type {
  RegistrationRepository,
  Registration,
  NewRegistrationInput,
  Category,
} from "./registration-repository";
export { DuplicateRegistrationEmailError } from "./registration-repository";
