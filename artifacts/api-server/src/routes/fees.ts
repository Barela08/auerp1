import { Router } from "express";
import { db } from "@workspace/db";
import { feesTable, studentsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/my", async (req, res) => {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const user = users[0];
  if (!user?.studentId) { res.status(404).json({ error: "Not a student" }); return; }

  const records = await db.select().from(feesTable).where(eq(feesTable.studentId, user.studentId));
  const totalFees = records.reduce((s, r) => s + r.totalFees, 0);
  const paidAmount = records.reduce((s, r) => s + r.paidAmount, 0);
  const pendingAmount = records.reduce((s, r) => s + r.pendingAmount, 0);

  res.json({
    totalFees,
    paidAmount,
    pendingAmount,
    records: records.map(r => formatFee(r, undefined)),
  });
});

router.get("/", async (req, res) => {
  const { studentId } = req.query as Record<string, string>;
  const rows = studentId
    ? await db.select().from(feesTable).where(eq(feesTable.studentId, parseInt(studentId)))
    : await db.select().from(feesTable);

  const result = await Promise.all(rows.map(async (r) => {
    const students = await db.select().from(studentsTable).where(eq(studentsTable.id, r.studentId));
    return formatFee(r, students[0]?.name);
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const data = req.body;
  data.pendingAmount = data.totalFees - (data.paidAmount || 0);
  data.status = data.paidAmount >= data.totalFees ? "paid" : data.paidAmount > 0 ? "partial" : "pending";
  const [fee] = await db.insert(feesTable).values(data).returning();
  res.status(201).json(formatFee(fee, undefined));
});

router.get("/:id/receipt", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(feesTable).where(eq(feesTable.id, id));
  const fee = rows[0];
  if (!fee) { res.status(404).json({ error: "Not found" }); return; }
  const students = await db.select().from(studentsTable).where(eq(studentsTable.id, fee.studentId));
  const student = students[0];

  const particulars = [
    { name: "REGISTRATION FEE", amount: 0 },
    { name: "SECURITY DEPOSIT HOSTEL", amount: 0 },
    { name: "TRANSPORTATION CHARGES", amount: 0 },
    { name: "OTHERS", amount: 0 },
    { name: "TUITION FEE", amount: fee.totalFees * 0.7 },
    { name: "EXAMINATION FEE", amount: fee.totalFees * 0.1 },
    { name: "DEVELOPMENT FEE", amount: fee.totalFees * 0.1 },
    { name: "LIBRARY FEE", amount: fee.totalFees * 0.05 },
    { name: "SPORTS FEE", amount: fee.totalFees * 0.05 },
  ];

  const totalAmount = fee.paidAmount;
  const words = numberToWords(totalAmount);

  res.json({
    id: fee.id,
    receiptNo: fee.receiptNo || `REC-${fee.id}`,
    receiptDate: fee.paidDate || new Date().toISOString().split("T")[0],
    studentName: student?.name || "N/A",
    fatherName: student?.fatherName || "N/A",
    enrollmentNo: student?.enrollmentNo || "N/A",
    admissionNo: student?.admissionNo || "N/A",
    course: student?.program || "N/A",
    address: student?.address ?? null,
    totalAmount,
    amountInWords: `Rupees ${words} Only`,
    paymentMode: fee.paymentMode || "UPI",
    bankName: "ICICI BANK",
    particulars,
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(feesTable).where(eq(feesTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatFee(rows[0], undefined));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;
  const existingRows = await db.select().from(feesTable).where(eq(feesTable.id, id));
  const existing = existingRows[0];
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  if (data.paidAmount !== undefined) {
    data.pendingAmount = existing.totalFees - data.paidAmount;
    data.status = data.paidAmount >= existing.totalFees ? "paid" : data.paidAmount > 0 ? "partial" : "pending";
  }

  const rows = await db.update(feesTable).set(data).where(eq(feesTable.id, id)).returning();
  res.json(formatFee(rows[0], undefined));
});

function formatFee(f: typeof feesTable.$inferSelect, studentName: string | undefined) {
  return {
    id: f.id,
    studentId: f.studentId,
    studentName: studentName ?? null,
    semester: f.semester,
    academicYear: f.academicYear ?? null,
    totalFees: f.totalFees,
    paidAmount: f.paidAmount,
    pendingAmount: f.pendingAmount,
    status: f.status,
    dueDate: f.dueDate,
    paidDate: f.paidDate ?? null,
    paymentMode: f.paymentMode ?? null,
    receiptNo: f.receiptNo ?? null,
    createdAt: f.createdAt.toISOString(),
  };
}

function numberToWords(amount: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
  }

  return convert(Math.floor(amount));
}

export default router;
