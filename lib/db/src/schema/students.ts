import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  enrollmentNo: text("enrollment_no").notNull().unique(),
  rollNo: text("roll_no").notNull(),
  admissionNo: text("admission_no"),
  program: text("program").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  section: text("section"),
  academicYear: text("academic_year"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  fatherName: text("father_name").notNull(),
  motherName: text("mother_name").notNull(),
  dob: text("dob"),
  address: text("address"),
  photoUrl: text("photo_url"),
  cgpa: real("cgpa"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
