import { Router } from "express";
import { db } from "@workspace/db";
import { examFormsTable, studentsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/my", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(404).json({ error: "Not a student" }); return; }

  const rows = await db.select().from(examFormsTable).where(eq(examFormsTable.studentId, user.studentId));
  res.json(rows.map(formatExamForm));
});

router.get("/", async (req, res) => {
  const { studentId, status } = req.query as Record<string, string>;
  const conditions = [];
  if (studentId) conditions.push(eq(examFormsTable.studentId, parseInt(studentId)));
  if (status) conditions.push(eq(examFormsTable.status, status as "pending" | "approved" | "rejected"));

  const rows = conditions.length
    ? await db.select().from(examFormsTable).where(and(...conditions))
    : await db.select().from(examFormsTable);

  const result = await Promise.all(rows.map(async (r) => {
    const students = await db.select().from(studentsTable).where(eq(studentsTable.id, r.studentId));
    return { ...formatExamForm(r), studentName: students[0]?.name ?? null };
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(403).json({ error: "Not a student" }); return; }

  const { semester, academicYear, examType, subjects } = req.body;
  const [form] = await db.insert(examFormsTable).values({
    studentId: user.studentId,
    semester,
    academicYear,
    examType,
    status: "pending",
    subjects: JSON.stringify(subjects),
  }).returning();
  res.status(201).json(formatExamForm(form));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(examFormsTable).where(eq(examFormsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatExamForm(rows[0]));
});

router.patch("/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, remarks } = req.body;
  const approvedAt = new Date();
  const rows = await db.update(examFormsTable)
    .set({ status, remarks, approvedAt, approvedBy: req.session?.userId ? String(req.session.userId) : null })
    .where(eq(examFormsTable.id, id))
    .returning();
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatExamForm(rows[0]));
});

function formatExamForm(f: typeof examFormsTable.$inferSelect) {
  let subjects: string[] = [];
  try { subjects = JSON.parse(f.subjects); } catch { subjects = []; }
  return {
    id: f.id,
    studentId: f.studentId,
    studentName: null as string | null,
    semester: f.semester,
    academicYear: f.academicYear,
    examType: f.examType,
    status: f.status,
    subjects,
    remarks: f.remarks ?? null,
    approvedBy: f.approvedBy ?? null,
    submittedAt: f.submittedAt.toISOString(),
    approvedAt: f.approvedAt ? f.approvedAt.toISOString() : null,
  };
}

export default router;
