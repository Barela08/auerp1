import { db } from "@workspace/db";
import {
  usersTable,
  studentsTable,
  staffTable,
  feesTable,
  attendanceTable,
  resultsTable,
  notificationsTable,
  calendarEventsTable,
  examFormsTable,
  siteSettings,
} from "@workspace/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Site Settings ──────────────────────────────────────────────
  await db
    .insert(siteSettings)
    .values([
      { key: "university_name", value: "Alliance University" },
      { key: "university_tagline", value: "NAAC A+ Accredited University" },
      { key: "academic_year", value: "2024-25" },
      { key: "current_semester", value: "4" },
    ])
    .onConflictDoNothing();

  // ── Staff records ──────────────────────────────────────────────
  const [staff1] = await db
    .insert(staffTable)
    .values([
      {
        name: "Dr. Ramesh Kumar",
        employeeId: "AU-FAC-001",
        department: "Computer Science",
        designation: "Associate Professor",
        email: "ramesh.kumar@alliance.edu",
        phone: "9876543210",
      },
      {
        name: "Prof. Sunita Sharma",
        employeeId: "AU-FAC-002",
        department: "Mathematics",
        designation: "Assistant Professor",
        email: "sunita.sharma@alliance.edu",
        phone: "9876543211",
      },
    ])
    .returning();

  // ── Student records ────────────────────────────────────────────
  const [student1] = await db
    .insert(studentsTable)
    .values([
      {
        name: "Nilesh Barela",
        enrollmentNo: "AU2021CS001",
        rollNo: "21CS001",
        admissionNo: "ADM-2021-001",
        universityRegNo: "REG-2021-CS-001",
        program: "B.Tech",
        department: "Computer Science",
        semester: 4,
        section: "A",
        academicYear: "2024-25",
        email: "barelanilesh483@gmail.com",
        phone: "9123456789",
        fatherName: "Ramesh Barela",
        motherName: "Sita Barela",
        dob: "2003-05-15",
        address: "123, MG Road, Bangalore - 560001",
        bloodGroup: "O+",
        category: "General",
        cgpa: 8.4,
        sgpa: 8.7,
        attendancePct: 84.5,
      },
      {
        name: "Priya Mehta",
        enrollmentNo: "AU2021CS002",
        rollNo: "21CS002",
        admissionNo: "ADM-2021-002",
        universityRegNo: "REG-2021-CS-002",
        program: "B.Tech",
        department: "Computer Science",
        semester: 4,
        section: "A",
        academicYear: "2024-25",
        email: "priya.mehta@student.alliance.edu",
        phone: "9123456790",
        fatherName: "Suresh Mehta",
        motherName: "Anita Mehta",
        dob: "2003-08-20",
        address: "45, HSR Layout, Bangalore - 560102",
        bloodGroup: "A+",
        category: "General",
        cgpa: 9.1,
        sgpa: 9.3,
        attendancePct: 91.0,
      },
    ])
    .returning();

  // ── Users ──────────────────────────────────────────────────────
  await db.insert(usersTable).values([
    {
      username: "nilesh.barela",
      passwordHash: "Nilu@2006",
      role: "student",
      name: "Nilesh Barela",
      email: "barelanilesh483@gmail.com",
      studentId: student1.id,
    },
    {
      username: "priya.mehta",
      passwordHash: "Priya@2006",
      role: "student",
      name: "Priya Mehta",
      email: "priya.mehta@student.alliance.edu",
      studentId: student1.id + 1,
    },
    {
      username: "ramesh.kumar",
      passwordHash: "Staff@2024",
      role: "staff",
      name: "Dr. Ramesh Kumar",
      email: "ramesh.kumar@alliance.edu",
      staffId: staff1.id,
    },
    {
      username: "admin",
      passwordHash: "Admin@2024",
      role: "admin",
      name: "Administrator",
      email: "admin@alliance.edu",
    },
  ]);

  // ── Fees ───────────────────────────────────────────────────────
  await db.insert(feesTable).values([
    {
      studentId: student1.id,
      semester: 1,
      academicYear: "2021-22",
      totalFees: 125000,
      paidAmount: 125000,
      pendingAmount: 0,
      status: "paid",
      dueDate: "2021-08-01",
      paidDate: "2021-07-25",
      paymentMode: "Online",
      receiptNo: "RCP-2021-001",
      feeType: "Semester Fee",
    },
    {
      studentId: student1.id,
      semester: 2,
      academicYear: "2021-22",
      totalFees: 125000,
      paidAmount: 125000,
      pendingAmount: 0,
      status: "paid",
      dueDate: "2022-01-01",
      paidDate: "2021-12-28",
      paymentMode: "Online",
      receiptNo: "RCP-2022-001",
      feeType: "Semester Fee",
    },
    {
      studentId: student1.id,
      semester: 3,
      academicYear: "2022-23",
      totalFees: 130000,
      paidAmount: 130000,
      pendingAmount: 0,
      status: "paid",
      dueDate: "2022-08-01",
      paidDate: "2022-07-30",
      paymentMode: "Bank Transfer",
      receiptNo: "RCP-2022-002",
      feeType: "Semester Fee",
    },
    {
      studentId: student1.id,
      semester: 4,
      academicYear: "2024-25",
      totalFees: 135000,
      paidAmount: 67500,
      pendingAmount: 67500,
      status: "partial",
      dueDate: "2024-08-15",
      paymentMode: "Online",
      receiptNo: "RCP-2024-001",
      feeType: "Semester Fee",
    },
  ]);

  // ── Attendance ─────────────────────────────────────────────────
  const subjects = [
    { id: 101, name: "Data Structures & Algorithms", code: "CS301" },
    { id: 102, name: "Database Management Systems", code: "CS302" },
    { id: 103, name: "Operating Systems", code: "CS303" },
    { id: 104, name: "Computer Networks", code: "CS304" },
    { id: 105, name: "Mathematics-IV", code: "MA301" },
  ];

  const attendanceRecords = [];
  const startDate = new Date("2024-08-01");
  const endDate = new Date("2024-11-30");

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = d.toISOString().split("T")[0];

    for (const subj of subjects) {
      const rand = Math.random();
      const status: "present" | "absent" | "late" =
        rand > 0.15 ? "present" : rand > 0.05 ? "late" : "absent";

      attendanceRecords.push({
        studentId: student1.id,
        subjectId: subj.id,
        subjectName: subj.name,
        subjectCode: subj.code,
        date: dateStr,
        status,
        markedBy: "Dr. Ramesh Kumar",
      });
    }
  }

  for (let i = 0; i < attendanceRecords.length; i += 100) {
    await db.insert(attendanceTable).values(attendanceRecords.slice(i, i + 100));
  }

  // ── Results ────────────────────────────────────────────────────
  await db.insert(resultsTable).values([
    {
      studentId: student1.id,
      semester: 1,
      academicYear: "2021-22",
      sgpa: 8.2,
      cgpa: 8.2,
      status: "pass",
      totalCredits: 24,
      equivalentPercentage: 78.5,
      resultDate: "2022-01-15",
      subjects: JSON.stringify([
        { code: "CS101", name: "Programming in C", credits: 4, grade: "B+", gradePoint: 8 },
        { code: "CS102", name: "Engineering Mathematics-I", credits: 4, grade: "A", gradePoint: 9 },
        { code: "CS103", name: "Basic Electronics", credits: 3, grade: "B", gradePoint: 7 },
        { code: "CS104", name: "Engineering Physics", credits: 3, grade: "B+", gradePoint: 8 },
        { code: "CS105", name: "English Communication", credits: 2, grade: "A+", gradePoint: 10 },
        { code: "CS106", name: "Workshop Practice", credits: 2, grade: "A", gradePoint: 9 },
      ]),
    },
    {
      studentId: student1.id,
      semester: 2,
      academicYear: "2021-22",
      sgpa: 8.5,
      cgpa: 8.35,
      status: "pass",
      totalCredits: 24,
      equivalentPercentage: 81.0,
      resultDate: "2022-06-20",
      subjects: JSON.stringify([
        { code: "CS201", name: "Data Structures", credits: 4, grade: "A", gradePoint: 9 },
        { code: "CS202", name: "Mathematics-II", credits: 4, grade: "B+", gradePoint: 8 },
        { code: "CS203", name: "Digital Electronics", credits: 3, grade: "A", gradePoint: 9 },
        { code: "CS204", name: "Object-Oriented Programming", credits: 4, grade: "A+", gradePoint: 10 },
        { code: "CS205", name: "Environmental Science", credits: 2, grade: "B+", gradePoint: 8 },
        { code: "CS206", name: "Lab Practice", credits: 2, grade: "A", gradePoint: 9 },
      ]),
    },
    {
      studentId: student1.id,
      semester: 3,
      academicYear: "2022-23",
      sgpa: 8.7,
      cgpa: 8.47,
      status: "pass",
      totalCredits: 24,
      equivalentPercentage: 83.4,
      resultDate: "2023-01-10",
      subjects: JSON.stringify([
        { code: "CS301", name: "Data Structures & Algorithms", credits: 4, grade: "A", gradePoint: 9 },
        { code: "CS302", name: "Database Management Systems", credits: 4, grade: "A+", gradePoint: 10 },
        { code: "CS303", name: "Operating Systems", credits: 4, grade: "B+", gradePoint: 8 },
        { code: "CS304", name: "Computer Networks", credits: 4, grade: "A", gradePoint: 9 },
        { code: "MA301", name: "Mathematics-III", credits: 4, grade: "B+", gradePoint: 8 },
        { code: "CS305", name: "Lab", credits: 2, grade: "A+", gradePoint: 10 },
      ]),
    },
  ]);

  // ── Exam Forms ─────────────────────────────────────────────────
  await db.insert(examFormsTable).values([
    {
      studentId: student1.id,
      semester: 4,
      academicYear: "2024-25",
      examType: "End Semester",
      status: "approved",
      subjects: JSON.stringify([
        "Data Structures & Algorithms",
        "Database Management Systems",
        "Operating Systems",
        "Computer Networks",
        "Mathematics-IV",
      ]),
      remarks: "All dues cleared",
      approvedBy: "Dr. Ramesh Kumar",
    },
    {
      studentId: student1.id,
      semester: 3,
      academicYear: "2022-23",
      examType: "End Semester",
      status: "approved",
      subjects: JSON.stringify([
        "Data Structures & Algorithms",
        "Database Management Systems",
        "Operating Systems",
        "Computer Networks",
        "Mathematics-III",
      ]),
      remarks: "Approved",
      approvedBy: "Dr. Ramesh Kumar",
    },
  ]);

  // ── Notifications ──────────────────────────────────────────────
  await db.insert(notificationsTable).values([
    {
      title: "End Semester Exam Schedule Released",
      message:
        "The end semester examination schedule for Semester 4 (2024-25) has been released. Students are advised to check their hall tickets. Exams begin from December 1, 2024.",
      targetRole: "student",
      priority: "urgent",
      createdBy: "Admin",
    },
    {
      title: "Fee Payment Reminder",
      message:
        "Students with pending semester fees are requested to clear their dues before November 30, 2024 to avoid late fee charges.",
      targetRole: "student",
      priority: "important",
      createdBy: "Accounts Office",
    },
    {
      title: "Republic Day Celebration",
      message:
        "Alliance University will celebrate Republic Day on 26th January 2025. All students and staff are invited to attend the flag hoisting ceremony at 9:00 AM on the main ground.",
      targetRole: "all",
      priority: "normal",
      createdBy: "Admin",
    },
    {
      title: "Library Books Return Notice",
      message:
        "All students are requested to return borrowed library books before December 15, 2024. Fine will be levied on delayed returns.",
      targetRole: "student",
      priority: "normal",
      createdBy: "Library",
    },
    {
      title: "Faculty Development Program",
      message:
        "A Faculty Development Program on 'AI in Education' is scheduled from November 25–27, 2024. All faculty members are requested to register by November 20.",
      targetRole: "staff",
      priority: "important",
      createdBy: "Admin",
    },
    {
      title: "Sports Day Registration Open",
      message:
        "Annual Sports Day 2024 registrations are now open. Students can register for their preferred sports events at the Sports Office or through the student portal.",
      targetRole: "student",
      priority: "normal",
      createdBy: "Sports Department",
    },
  ]);

  // ── Calendar Events ────────────────────────────────────────────
  await db.insert(calendarEventsTable).values([
    {
      title: "Independence Day",
      description: "National Holiday",
      startDate: "2024-08-15",
      eventType: "holiday",
      createdBy: "Admin",
    },
    {
      title: "Gandhi Jayanti",
      description: "National Holiday",
      startDate: "2024-10-02",
      eventType: "holiday",
      createdBy: "Admin",
    },
    {
      title: "Diwali Break",
      description: "Festival Holiday",
      startDate: "2024-11-01",
      endDate: "2024-11-05",
      eventType: "holiday",
      createdBy: "Admin",
    },
    {
      title: "Mid-Semester Exams",
      description: "Mid-semester examinations for all semesters",
      startDate: "2024-09-23",
      endDate: "2024-09-30",
      eventType: "exam",
      createdBy: "Exam Cell",
    },
    {
      title: "End Semester Exams",
      description: "End semester examinations — Semester 4",
      startDate: "2024-12-01",
      endDate: "2024-12-20",
      eventType: "exam",
      createdBy: "Exam Cell",
    },
    {
      title: "Exam Form Submission Deadline",
      description: "Last date to submit end semester exam forms",
      startDate: "2024-11-15",
      eventType: "deadline",
      createdBy: "Exam Cell",
    },
    {
      title: "Fee Payment Last Date",
      description: "Last date to pay semester fees without late fine",
      startDate: "2024-11-30",
      eventType: "deadline",
      createdBy: "Accounts Office",
    },
    {
      title: "Annual Tech Fest – AllianceFest 2024",
      description: "Annual technical and cultural festival",
      startDate: "2024-10-18",
      endDate: "2024-10-20",
      eventType: "event",
      createdBy: "Student Council",
    },
    {
      title: "Annual Sports Day",
      description: "Inter-department sports competition",
      startDate: "2024-11-22",
      eventType: "event",
      createdBy: "Sports Department",
    },
    {
      title: "Winter Break",
      description: "Winter vacation",
      startDate: "2024-12-22",
      endDate: "2025-01-05",
      eventType: "holiday",
      createdBy: "Admin",
    },
    {
      title: "Republic Day",
      description: "National Holiday",
      startDate: "2025-01-26",
      eventType: "holiday",
      createdBy: "Admin",
    },
    {
      title: "Result Declaration",
      description: "Semester 4 result declaration",
      startDate: "2025-01-15",
      eventType: "announcement",
      createdBy: "Exam Cell",
    },
  ]);

  console.log("✅ Seeding complete!");
  console.log("");
  console.log("Demo Credentials:");
  console.log("  Student : barelanilesh483@gmail.com / Nilu@2006");
  console.log("  Staff   : ramesh.kumar@alliance.edu / Staff@2024");
  console.log("  Admin   : admin@alliance.edu        / Admin@2024");
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
