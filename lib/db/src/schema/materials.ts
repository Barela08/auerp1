import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const materialsTable = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  type: text("type").notNull().default("notes"), // notes | assignment | resource
  fileName: text("file_name"),
  fileData: text("file_data"), // base64
  contentType: text("content_type"),
  uploadedByStaffId: integer("uploaded_by_staff_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Material = typeof materialsTable.$inferSelect;
export type InsertMaterial = typeof materialsTable.$inferInsert;
