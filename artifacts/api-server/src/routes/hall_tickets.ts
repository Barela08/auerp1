import { Router } from "express";
import { db } from "@workspace/db";
import { examFormsTable, studentsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function generateHallTicket(form: typeof examFormsTable.$inferSelect, student: typeof studentsTable.$inferSelect) {
  let subjects: string[] = [];
  try { subjects = JSON.parse(form.subjects); } catch { subjects = []; }

  const subjectDetails = subjects.map((name, i) => ({
    date: `2024-05-${15 + i}`,
    subjectCode: `CS${401 + i}`,
    subjectName: name,
    time: "10:00 AM - 01:00 PM",
  }));

  return {
    id: form.id,
    examFormId: form.id,
    studentName: student.name,
    enrollmentNo: student.enrollmentNo,
    rollNo: student.rollNo,
    program: student.program,
    semester: form.semester,
    examType: form.examType,
    examCenter: "Alliance University Main Campus, Bengaluru",
    examYear: form.academicYear,
    subjects: subjectDetails,
    photoUrl: student.photoUrl ?? null,
  };
}

router.get("/my", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(404).json({ error: "Not a student" }); return; }

  const forms = await db.select().from(examFormsTable)
    .where(and(eq(examFormsTable.studentId, user.studentId), eq(examFormsTable.status, "approved")));
  const students = await db.select().from(studentsTable).where(eq(studentsTable.id, user.studentId));
  const student = students[0];
  if (!student) { res.status(404).json({ error: "Student not found" }); return; }

  res.json(forms.map(f => generateHallTicket(f, student)));
});

router.get("/:examFormId", async (req, res) => {
  const examFormId = parseInt(req.params.examFormId);
  const forms = await db.select().from(examFormsTable)
    .where(and(eq(examFormsTable.id, examFormId), eq(examFormsTable.status, "approved")));
  if (!forms[0]) { res.status(404).json({ error: "Hall ticket not available" }); return; }

  const students = await db.select().from(studentsTable).where(eq(studentsTable.id, forms[0].studentId));
  if (!students[0]) { res.status(404).json({ error: "Student not found" }); return; }

  res.json(generateHallTicket(forms[0], students[0]));
});

export default router;
