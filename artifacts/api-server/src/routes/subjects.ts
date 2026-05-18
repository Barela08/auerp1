import { Router } from "express";
import { db, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { department, semester } = req.query as Record<string, string>;
  let rows = await db.select().from(subjectsTable);
  if (department) rows = rows.filter(r => r.department === department);
  if (semester) rows = rows.filter(r => r.semester === parseInt(semester));
  res.json(rows);
});

router.post("/", async (req, res) => {
  const [row] = await db.insert(subjectsTable).values(req.body).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.update(subjectsTable).set(req.body).where(eq(subjectsTable.id, id)).returning();
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(subjectsTable).where(eq(subjectsTable.id, id));
  res.status(204).send();
});

export default router;
