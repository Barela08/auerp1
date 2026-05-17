import { Router } from "express";
import { db } from "@workspace/db";
import { studentsTable, staffTable, feesTable, examFormsTable, notificationsTable, attendanceTable, resultsTable, calendarEventsTable, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/student", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(403).json({ error: "Not a student" }); return; }

  const students = await db.select().from(studentsTable).where(eq(studentsTable.id, user.studentId));
  const student = students[0];
  if (!student) { res.status(404).json({ error: "Student not found" }); return; }

  const feeRows = await db.select().from(feesTable).where(eq(feesTable.studentId, user.studentId));
  const totalFees = feeRows.reduce((s, r) => s + r.totalFees, 0);
  const paidAmount = feeRows.reduce((s, r) => s + r.paidAmount, 0);
  const pendingAmount = feeRows.reduce((s, r) => s + r.pendingAmount, 0);

  const attendanceRows = await db.select().from(attendanceTable).where(eq(attendanceTable.studentId, user.studentId));
  const subjectMap = new Map<number, { name: string; code: string | null; total: number; attended: number }>();
  for (const r of attendanceRows) {
    const existing = subjectMap.get(r.subjectId) || { name: r.subjectName, code: r.subjectCode, total: 0, attended: 0 };
    existing.total++;
    if (r.status === "present" || r.status === "late") existing.attended++;
    subjectMap.set(r.subjectId, existing);
  }
  const attendanceSummary = Array.from(subjectMap.entries()).map(([subjectId, data]) => ({
    subjectId,
    subjectName: data.name,
    subjectCode: data.code ?? null,
    totalClasses: data.total,
    attendedClasses: data.attended,
    percentage: data.total > 0 ? Math.round((data.attended / data.total) * 100 * 10) / 10 : 0,
  }));

  const notifications = await db.select().from(notificationsTable);
  const recentNotifications = notifications
    .filter(n => n.targetRole === "all" || n.targetRole === "student")
    .slice(-5)
    .map(n => ({
      id: n.id, title: n.title, message: n.message, targetRole: n.targetRole,
      priority: n.priority, createdAt: n.createdAt.toISOString(), createdBy: n.createdBy ?? null,
    }));

  const calendarEvents = await db.select().from(calendarEventsTable);
  const upcomingExams = calendarEvents
    .filter(e => e.eventType === "exam")
    .slice(0, 5)
    .map(e => ({
      id: e.id, title: e.title, description: e.description ?? null,
      startDate: e.startDate, endDate: e.endDate ?? null, eventType: e.eventType,
      createdBy: e.createdBy ?? null,
    }));

  const resultRows = await db.select().from(resultsTable).where(eq(resultsTable.studentId, user.studentId));
  const recentResults = resultRows.slice(-3).map(r => {
    let subjects = [];
    try { subjects = JSON.parse(r.subjects); } catch { subjects = []; }
    return {
      id: r.id, studentId: r.studentId, studentName: student.name,
      semester: r.semester, academicYear: r.academicYear, sgpa: r.sgpa, cgpa: r.cgpa,
      status: r.status, totalCredits: r.totalCredits, equivalentPercentage: r.equivalentPercentage ?? null,
      subjects, resultDate: r.resultDate ?? null,
    };
  });

  const examForms = await db.select().from(examFormsTable).where(eq(examFormsTable.studentId, user.studentId));
  const pendingExamForms = examForms.filter(f => f.status === "pending").length;

  const studentData = {
    id: student.id, name: student.name, enrollmentNo: student.enrollmentNo,
    rollNo: student.rollNo, admissionNo: student.admissionNo ?? null,
    program: student.program, department: student.department, semester: student.semester,
    section: student.section ?? null, academicYear: student.academicYear ?? null,
    email: student.email, phone: student.phone, fatherName: student.fatherName,
    motherName: student.motherName, dob: student.dob ?? null, address: student.address ?? null,
    photoUrl: student.photoUrl ?? null, cgpa: student.cgpa ?? null, createdAt: student.createdAt.toISOString(),
  };

  res.json({
    student: studentData,
    feeSummary: { totalFees, paidAmount, pendingAmount, records: feeRows.map(f => ({
      id: f.id, studentId: f.studentId, studentName: null, semester: f.semester,
      academicYear: f.academicYear ?? null, totalFees: f.totalFees, paidAmount: f.paidAmount,
      pendingAmount: f.pendingAmount, status: f.status, dueDate: f.dueDate,
      paidDate: f.paidDate ?? null, paymentMode: f.paymentMode ?? null, receiptNo: f.receiptNo ?? null,
      createdAt: f.createdAt.toISOString(),
    })) },
    attendanceSummary,
    recentNotifications,
    upcomingExams,
    recentResults,
    pendingExamForms,
  });
});

router.get("/admin", async (req, res) => {
  const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(studentsTable);
  const [staffCount] = await db.select({ count: sql<number>`count(*)` }).from(staffTable);
  const feeRows = await db.select().from(feesTable);
  const totalRevenue = feeRows.reduce((s, r) => s + r.paidAmount, 0);
  const pendingFees = feeRows.reduce((s, r) => s + r.pendingAmount, 0);
  const examForms = await db.select().from(examFormsTable);
  const pendingExamForms = examForms.filter(f => f.status === "pending").length;

  const notifications = await db.select().from(notificationsTable);
  const recentNotifications = notifications.slice(-5).map(n => ({
    id: n.id, title: n.title, message: n.message, targetRole: n.targetRole,
    priority: n.priority, createdAt: n.createdAt.toISOString(), createdBy: n.createdBy ?? null,
  }));

  const students = await db.select().from(studentsTable);
  const deptMap = new Map<string, number>();
  for (const s of students) {
    deptMap.set(s.department, (deptMap.get(s.department) || 0) + 1);
  }
  const departmentStats = Array.from(deptMap.entries()).map(([department, studentCount]) => ({
    department, studentCount,
  }));

  res.json({
    totalStudents: Number(studentCount.count),
    totalStaff: Number(staffCount.count),
    totalRevenue,
    pendingFees,
    pendingExamForms,
    activeStudents: Number(studentCount.count),
    recentNotifications,
    departmentStats,
  });
});

export default router;
