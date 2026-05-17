import { Router } from "express";
import { db } from "@workspace/db";
import { studentsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function buildIdCard(student: typeof studentsTable.$inferSelect) {
  return {
    studentId: student.id,
    studentName: student.name,
    enrollmentNo: student.enrollmentNo,
    rollNo: student.rollNo ?? null,
    program: student.program,
    department: student.department,
    academicYear: student.academicYear || "2024-25",
    photoUrl: student.photoUrl ?? null,
    barcode: student.enrollmentNo,
    bloodGroup: null as string | null,
    phone: student.phone ?? null,
    address: student.address ?? null,
  };
}

router.get("/my/id-card", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(404).json({ error: "Not a student" }); return; }

  const students = await db.select().from(studentsTable).where(eq(studentsTable.id, user.studentId));
  if (!students[0]) { res.status(404).json({ error: "Student not found" }); return; }
  res.json(buildIdCard(students[0]));
});

router.get("/:studentId/id-card", async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const students = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
  if (!students[0]) { res.status(404).json({ error: "Student not found" }); return; }
  res.json(buildIdCard(students[0]));
});

router.patch("/:studentId/id-card", async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const rows = await db.update(studentsTable).set(req.body).where(eq(studentsTable.id, studentId)).returning();
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(buildIdCard(rows[0]));
});

export default router;
