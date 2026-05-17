import { Router } from "express";
import { db } from "@workspace/db";
import { resultsTable, studentsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/my", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(404).json({ error: "Not a student" }); return; }

  const rows = await db.select().from(resultsTable).where(eq(resultsTable.studentId, user.studentId));
  res.json(rows.map(formatResult));
});

router.get("/", async (req, res) => {
  const { studentId, semester } = req.query as Record<string, string>;
  const conditions = [];
  if (studentId) conditions.push(eq(resultsTable.studentId, parseInt(studentId)));
  if (semester) conditions.push(eq(resultsTable.semester, parseInt(semester)));

  const rows = conditions.length
    ? await db.select().from(resultsTable).where(and(...conditions))
    : await db.select().from(resultsTable);

  const result = await Promise.all(rows.map(async (r) => {
    const students = await db.select().from(studentsTable).where(eq(studentsTable.id, r.studentId));
    return { ...formatResult(r), studentName: students[0]?.name ?? null };
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const { subjects, ...rest } = req.body;
  const [result] = await db.insert(resultsTable).values({
    ...rest,
    subjects: JSON.stringify(subjects),
  }).returning();
  res.status(201).json(formatResult(result));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(resultsTable).where(eq(resultsTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatResult(rows[0]));
});

function formatResult(r: typeof resultsTable.$inferSelect) {
  let subjects = [];
  try { subjects = JSON.parse(r.subjects); } catch { subjects = []; }
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: null as string | null,
    semester: r.semester,
    academicYear: r.academicYear,
    sgpa: r.sgpa,
    cgpa: r.cgpa,
    status: r.status,
    totalCredits: r.totalCredits,
    equivalentPercentage: r.equivalentPercentage ?? null,
    subjects,
    resultDate: r.resultDate ?? null,
  };
}

export default router;
