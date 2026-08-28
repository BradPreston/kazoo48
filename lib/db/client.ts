import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/lib/env";
import * as schema from "./schema";

function createDb() {
  const client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

// The libsql client talks over HTTP rather than holding a persistent
// connection pool, so re-creating it isn't costly at request-time the way
// it would be for e.g. Postgres. Still cache on `globalThis` in dev to avoid
// constructing a fresh client on every Next.js HMR reload.
const globalForDb = globalThis as unknown as {
  __db: ReturnType<typeof createDb> | undefined;
};

export const db = globalForDb.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
}
