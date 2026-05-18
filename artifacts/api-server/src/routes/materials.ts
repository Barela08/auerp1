import { Router } from "express";
import { db, materialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await db.select().from(materialsTable).orderBy(materialsTable.createdAt);
  res.json(rows.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    subject: m.subject,
    type: m.type,
    fileName: m.fileName,
    contentType: m.contentType,
    uploadedByStaffId: m.uploadedByStaffId,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.get("/:id/file", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.select().from(materialsTable).where(eq(materialsTable.id, id));
  const mat = rows[0];
  if (!mat || !mat.fileData) { res.status(404).json({ error: "Not found" }); return; }
  const base64 = mat.fileData.replace(/^data:[^;]+;base64,/, "");
  const buf = Buffer.from(base64, "base64");
  res.set("Content-Type", mat.contentType || "application/octet-stream");
  res.set("Content-Disposition", `attachment; filename="${mat.fileName || "file"}"`);
  res.send(buf);
});

router.post("/", async (req, res) => {
  const [row] = await db.insert(materialsTable).values(req.body).returning();
  res.status(201).json({ id: row.id, title: row.title, subject: row.subject, type: row.type, fileName: row.fileName, createdAt: row.createdAt.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(materialsTable).where(eq(materialsTable.id, id));
  res.status(204).send();
});

export default router;
