import { Router } from "express";
import { db } from "@workspace/db";
import { studentsTable } from "@workspace/db";
import { eq, like, and, SQL } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { search, department, semester } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (department) conditions.push(eq(studentsTable.department, department));
  if (semester) conditions.push(eq(studentsTable.semester, parseInt(semester)));

  let rows = await db.select().from(studentsTable).where(conditions.length ? and(...conditions) : undefined);
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(r =>
      r.name.toLowerCase().includes(s) ||
      r.enrollmentNo.toLowerCase().includes(s) ||
      r.rollNo.toLowerCase().includes(s)
    );
  }
  res.json(rows.map(formatStudent));
});

router.post("/", async (req, res) => {
  const { password, ...data } = req.body;
  const [student] = await db.insert(studentsTable).values(data).returning();
  // Create user account
  if (password) {
    const { usersTable } = await import("@workspace/db");
    await db.insert(usersTable).values({
      username: student.enrollmentNo,
      passwordHash: password,
      role: "student",
      name: student.name,
      email: student.email,
      studentId: student.id,
    });
  }
  res.status(201).json(formatStudent(student));
});

router.get("/me/profile", async (req, res) => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const { usersTable } = await import("@workspace/db");
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const students = await db.select().from(studentsTable).where(eq(studentsTable.id, user.studentId));
  const student = students[0];
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(formatStudent(student));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(studentsTable).where(eq(studentsTable.id, id));
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatStudent(rows[0]));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.update(studentsTable).set(req.body).where(eq(studentsTable.id, id)).returning();
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatStudent(rows[0]));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(studentsTable).where(eq(studentsTable.id, id));
  res.status(204).send();
});

function formatStudent(s: typeof studentsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    enrollmentNo: s.enrollmentNo,
    rollNo: s.rollNo,
    admissionNo: s.admissionNo ?? null,
    program: s.program,
    department: s.department,
    semester: s.semester,
    section: s.section ?? null,
    academicYear: s.academicYear ?? null,
    email: s.email,
    phone: s.phone,
    fatherName: s.fatherName,
    motherName: s.motherName,
    dob: s.dob ?? null,
    address: s.address ?? null,
    photoUrl: s.photoUrl ?? null,
    cgpa: s.cgpa ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

export default router;
