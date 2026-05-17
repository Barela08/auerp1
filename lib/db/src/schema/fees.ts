import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const feesTable = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year"),
  totalFees: real("total_fees").notNull(),
  paidAmount: real("paid_amount").notNull().default(0),
  pendingAmount: real("pending_amount").notNull(),
  status: text("status").notNull().default("pending").$type<"paid" | "partial" | "pending">(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  paymentMode: text("payment_mode"),
  receiptNo: text("receipt_no"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeeSchema = createInsertSchema(feesTable).omit({ id: true, createdAt: true });
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type FeeRecord = typeof feesTable.$inferSelect;
