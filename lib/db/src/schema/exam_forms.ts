import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const examFormsTable = pgTable("exam_forms", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  examType: text("exam_type").notNull(),
  status: text("status").notNull().default("pending").$type<"pending" | "approved" | "rejected">(),
  subjects: text("subjects").notNull(), // JSON array stored as text
  remarks: text("remarks"),
  approvedBy: text("approved_by"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

export const insertExamFormSchema = createInsertSchema(examFormsTable).omit({ id: true, submittedAt: true, approvedAt: true });
export type InsertExamForm = z.infer<typeof insertExamFormSchema>;
export type ExamForm = typeof examFormsTable.$inferSelect;
