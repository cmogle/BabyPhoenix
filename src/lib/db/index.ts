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
const DIRECT_SUPABASE_HOST = "db.zhljzwcjidtpshgkdiqr.supabase.co";
const SUPABASE_POOLER_HOST = "aws-0-ap-southeast-2.pooler.supabase.com";
const SUPABASE_POOLER_USER = "postgres.zhljzwcjidtpshgkdiqr";
const SUPABASE_POOLER_PORT = "6543";

function getRuntimeDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(rawUrl);

  if (url.hostname === DIRECT_SUPABASE_HOST) {
    url.hostname = SUPABASE_POOLER_HOST;
    url.port = SUPABASE_POOLER_PORT;
    url.username = SUPABASE_POOLER_USER;

    console.warn(
      "Normalizing DATABASE_URL from direct Supabase host to pooler host for runtime compatibility."
    );
  }

  return url.toString();
}

const client = postgres(getRuntimeDatabaseUrl(), {
  prepare: false,
  ssl: "require",
});

export const db = drizzle(client, { schema, logger: false });
