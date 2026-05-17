import { Router } from "express";
import { db } from "@workspace/db";
import { staffTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await db.select().from(staffTable);
  res.json(rows.map(formatStaff));
});

router.post("/", async (req, res) => {
  const { password, ...data } = req.body;
  const [staff] = await db.insert(staffTable).values(data).returning();
  if (password) {
    await db.insert(usersTable).values({
      username: staff.employeeId,
      passwordHash: password,
      role: "staff",
      name: staff.name,
      email: staff.email,
      staffId: staff.id,
    });
  }
  res.status(201).json(formatStaff(staff));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(staffTable).where(eq(staffTable.id, id));
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatStaff(rows[0]));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.update(staffTable).set(req.body).where(eq(staffTable.id, id)).returning();
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatStaff(rows[0]));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(staffTable).where(eq(staffTable.id, id));
  res.status(204).send();
});

function formatStaff(s: typeof staffTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    employeeId: s.employeeId,
    department: s.department,
    designation: s.designation,
    email: s.email,
    phone: s.phone,
    photoUrl: s.photoUrl ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

export default router;
