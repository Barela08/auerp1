import { Router } from "express";
import { db } from "@workspace/db";
import { attendanceTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/my", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(404).json({ error: "Not a student" }); return; }

  const records = await db.select().from(attendanceTable).where(eq(attendanceTable.studentId, user.studentId));

  // Group by subject
  const subjectMap = new Map<number, { name: string; code: string | null; total: number; attended: number }>();
  for (const r of records) {
    const existing = subjectMap.get(r.subjectId) || { name: r.subjectName, code: r.subjectCode, total: 0, attended: 0 };
    existing.total++;
    if (r.status === "present" || r.status === "late") existing.attended++;
    subjectMap.set(r.subjectId, existing);
  }

  const result = Array.from(subjectMap.entries()).map(([subjectId, data]) => ({
    subjectId,
    subjectName: data.name,
    subjectCode: data.code ?? null,
    totalClasses: data.total,
    attendedClasses: data.attended,
    percentage: data.total > 0 ? Math.round((data.attended / data.total) * 100 * 10) / 10 : 0,
  }));

  res.json(result);
});

router.get("/my/:subjectId", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(404).json({ error: "Not a student" }); return; }

  const subjectId = parseInt(req.params.subjectId);
  const records = await db.select().from(attendanceTable)
    .where(and(eq(attendanceTable.studentId, user.studentId), eq(attendanceTable.subjectId, subjectId)));

  res.json(records.map(formatAttendance));
});

router.get("/", async (req, res) => {
  const { studentId, subjectId } = req.query as Record<string, string>;
  const conditions = [];
  if (studentId) conditions.push(eq(attendanceTable.studentId, parseInt(studentId)));
  if (subjectId) conditions.push(eq(attendanceTable.subjectId, parseInt(subjectId)));

  const rows = conditions.length
    ? await db.select().from(attendanceTable).where(and(...conditions))
    : await db.select().from(attendanceTable);
  res.json(rows.map(formatAttendance));
});

router.post("/", async (req, res) => {
  const { studentId, subjectId, date, status } = req.body;
  // Get subject name from existing records or default
  const existing = await db.select().from(attendanceTable)
    .where(and(eq(attendanceTable.studentId, studentId), eq(attendanceTable.subjectId, subjectId)));
  const subjectName = existing[0]?.subjectName || `Subject ${subjectId}`;
  const subjectCode = existing[0]?.subjectCode || null;

  const [record] = await db.insert(attendanceTable).values({
    studentId, subjectId, date, status, subjectName, subjectCode,
    markedBy: req.session?.userId ? String(req.session.userId) : null,
  }).returning();
  res.status(201).json(formatAttendance(record));
});

function formatAttendance(r: typeof attendanceTable.$inferSelect) {
  return {
    id: r.id,
    studentId: r.studentId,
    subjectId: r.subjectId,
    subjectName: r.subjectName,
    subjectCode: r.subjectCode ?? null,
    date: r.date,
    status: r.status,
    markedBy: r.markedBy ?? null,
  };
}

export default router;
