import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { targetRole } = req.query as Record<string, string>;
  let rows;
  if (targetRole && targetRole !== "all") {
    rows = await db.select().from(notificationsTable)
      .where(or(eq(notificationsTable.targetRole, "all"), eq(notificationsTable.targetRole, targetRole as "student" | "staff" | "admin")));
  } else {
    rows = await db.select().from(notificationsTable);
  }
  res.json(rows.map(formatNotification));
});

router.post("/", async (req, res) => {
  const { title, message, targetRole, priority } = req.body;
  const [notification] = await db.insert(notificationsTable).values({
    title, message, targetRole, priority: priority || "normal",
    createdBy: req.session?.userId ? String(req.session.userId) : null,
  }).returning();
  res.status(201).json(formatNotification(notification));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.update(notificationsTable).set(req.body).where(eq(notificationsTable.id, id)).returning();
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatNotification(rows[0]));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
  res.status(204).send();
});

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    targetRole: n.targetRole,
    priority: n.priority,
    createdAt: n.createdAt.toISOString(),
    createdBy: n.createdBy ?? null,
  };
}

export default router;
