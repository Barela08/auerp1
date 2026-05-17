import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettings } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const SETTING_KEYS = [
  "logo_round",
  "logo_horizontal",
  "student_login_bg",
  "staff_login_bg",
  "admin_login_bg",
  "signature_controller",
  "signature_registrar",
  "signature_exam",
  "hall_ticket_header",
  "receipt_header",
];

router.get("/", async (_req, res) => {
  const rows = await db.select().from(siteSettings);
  const result: Record<string, string | null> = {};
  for (const key of SETTING_KEYS) {
    const row = rows.find((r) => r.key === key);
    if (row?.imageData) {
      result[key] = `/api/branding/image/${key}`;
    } else {
      result[key] = null;
    }
  }
  res.json(result);
});

router.get("/image/:key", async (req, res) => {
  const { key } = req.params;
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  const row = rows[0];
  if (!row?.imageData) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  const base64 = row.imageData.replace(/^data:[^;]+;base64,/, "");
  const buf = Buffer.from(base64, "base64");
  res.set("Content-Type", row.contentType || "image/png");
  res.set("Cache-Control", "public, max-age=3600");
  res.send(buf);
});

router.post("/image/:key", async (req, res) => {
  if (!req.session?.userId || req.session?.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const { key } = req.params;
  if (!SETTING_KEYS.includes(key)) {
    res.status(400).json({ error: "Invalid key" });
    return;
  }
  const { data, contentType } = req.body;
  if (!data) {
    res.status(400).json({ error: "Missing data" });
    return;
  }
  await db
    .insert(siteSettings)
    .values({ key, imageData: data, contentType: contentType || "image/png", updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { imageData: data, contentType: contentType || "image/png", updatedAt: new Date() },
    });
  res.json({ success: true, url: `/api/branding/image/${key}` });
});

router.delete("/image/:key", async (req, res) => {
  if (!req.session?.userId || req.session?.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  const { key } = req.params;
  await db.update(siteSettings).set({ imageData: null, contentType: null }).where(eq(siteSettings.key, key));
  res.json({ success: true });
});

export default router;
