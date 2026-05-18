import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import staffRouter from "./staff";
import feesRouter from "./fees";
import attendanceRouter from "./attendance";
import examFormsRouter from "./exam_forms";
import hallTicketsRouter from "./hall_tickets";
import resultsRouter from "./results";
import notificationsRouter from "./notifications";
import documentsRouter from "./documents";
import calendarRouter from "./calendar";
import dashboardRouter from "./dashboard";
import brandingRouter from "./branding";
import subjectsRouter from "./subjects";
import materialsRouter from "./materials";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/branding", brandingRouter);
router.use("/subjects", subjectsRouter);
router.use("/materials", materialsRouter);
router.use("/students", studentsRouter);
router.use("/staff", staffRouter);
router.use("/fees", feesRouter);
router.use("/attendance", attendanceRouter);
router.use("/exam-forms", examFormsRouter);
router.use("/hall-tickets", hallTicketsRouter);
router.use("/results", resultsRouter);
router.use("/notifications", notificationsRouter);
router.use("/documents", documentsRouter);
router.use("/calendar", calendarRouter);
router.use("/dashboard", dashboardRouter);

export default router;
