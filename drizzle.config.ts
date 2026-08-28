import { defineConfig } from "drizzle-kit";

// Defaults to a local SQLite file so `pnpm db:push`/`db:studio` work with no
// Turso account. Set TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) in .env once
// you're ready to point at a real Turso database.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    // `?? ""` -> falsy check so a blank `TURSO_DATABASE_URL=` line in .env
    // (not just an absent one) still falls back to the local file.
    url: process.env.TURSO_DATABASE_URL || "file:./local.db",
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
});
