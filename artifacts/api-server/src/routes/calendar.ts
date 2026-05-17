import { Router } from "express";
import { db } from "@workspace/db";
import { calendarEventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await db.select().from(calendarEventsTable);
  res.json(rows.map(formatEvent));
});

router.post("/", async (req, res) => {
  const { title, description, startDate, endDate, eventType } = req.body;
  const [event] = await db.insert(calendarEventsTable).values({
    title, description, startDate, endDate, eventType,
    createdBy: req.session?.userId ? String(req.session.userId) : null,
  }).returning();
  res.status(201).json(formatEvent(event));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const rows = await db.update(calendarEventsTable).set(req.body).where(eq(calendarEventsTable.id, id)).returning();
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatEvent(rows[0]));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(calendarEventsTable).where(eq(calendarEventsTable.id, id));
  res.status(204).send();
});

function formatEvent(e: typeof calendarEventsTable.$inferSelect) {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? null,
    startDate: e.startDate,
    endDate: e.endDate ?? null,
    eventType: e.eventType,
    createdBy: e.createdBy ?? null,
  };
}

export default router;
