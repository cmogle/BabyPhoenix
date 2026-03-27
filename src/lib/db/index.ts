import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL should point to one of:
//   1. Supavisor session-mode pooler (IPv4-safe, works on Vercel):
//      postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
//   2. Direct connection with IPv4 add-on enabled:
//      postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
//
// See CLAUDE.md and .env.local for details on which to use.
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  ssl: "require",
});

export const db = drizzle(client, { schema, logger: false });
