import { defineConfig } from "drizzle-kit";
import path from "path";

const connectionString =
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_o8lFNtOjBI3H@ep-spring-bread-ap2ghen9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
