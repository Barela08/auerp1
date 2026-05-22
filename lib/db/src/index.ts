import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const rawUrl = process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("DATABASE_URL environment variable is required but was not provided.");
}

// Strip parameters unsupported by node-postgres (e.g. channel_binding)
function cleanConnectionString(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return url;
  }
}

const connectionString = cleanConnectionString(rawUrl);

// Use ssl:true when sslmode=require is in the URL (needed for Neon / Vercel)
const needsSsl = rawUrl.includes("sslmode=require") || rawUrl.includes("neon.tech");

export const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  // Keep pool small for serverless environments (Vercel)
  max: process.env.VERCEL ? 1 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
