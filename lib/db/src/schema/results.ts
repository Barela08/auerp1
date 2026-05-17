import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resultsTable = pgTable("results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  sgpa: real("sgpa").notNull(),
  cgpa: real("cgpa").notNull(),
  status: text("status").notNull().$type<"pass" | "fail" | "withheld">(),
  totalCredits: integer("total_credits").notNull(),
  equivalentPercentage: real("equivalent_percentage"),
  subjects: text("subjects").notNull(), // JSON stored as text
  resultDate: text("result_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertResultSchema = createInsertSchema(resultsTable).omit({ id: true, createdAt: true });
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof resultsTable.$inferSelect;
