import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString =
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_o8lFNtOjBI3H@ep-spring-bread-ap2ghen9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";


export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
